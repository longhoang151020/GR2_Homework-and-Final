"""Vong lap train/validation, checkpoint theo val loss, danh gia."""
import copy, time
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
from model import MLP

DEFAULT = dict(lr=1e-2, batch_size=64, epochs=300, activation="tanh")
ACTS = {"tanh": nn.Tanh, "relu": nn.ReLU, "sigmoid": nn.Sigmoid}


class Scaler:
    """Chuan hoa dau vao, chi fit tren tap train (tranh ro ri du lieu)."""
    def __init__(self, x):
        self.m, self.s = x.mean(0), x.std(0) + 1e-8
    def __call__(self, x):
        return ((x - self.m) / self.s).astype(np.float32)


def set_seed(seed):
    np.random.seed(seed); torch.manual_seed(seed)


@torch.no_grad()
def predict(model, x):
    model.eval()
    return model(torch.from_numpy(x)).numpy()


def metrics(y, yhat):
    err = yhat - y
    mse = float(np.mean(err ** 2))
    ss_res, ss_tot = np.sum(err ** 2), np.sum((y - y.mean()) ** 2)
    return dict(mse=mse, mae=float(np.mean(np.abs(err))), rmse=float(np.sqrt(mse)),
                r2=float(1 - ss_res / ss_tot))


def fit(hidden, xtr, ytr, xva, yva, seed=0, cfg=None, ckpt_path=None):
    cfg = {**DEFAULT, **(cfg or {})}
    set_seed(seed)
    sc = Scaler(xtr)
    Xtr, Ytr = torch.from_numpy(sc(xtr)), torch.from_numpy(ytr)
    Xva, Yva = torch.from_numpy(sc(xva)), torch.from_numpy(yva)
    loader = DataLoader(TensorDataset(Xtr, Ytr), batch_size=cfg["batch_size"], shuffle=True,
                        generator=torch.Generator().manual_seed(seed))
    model = MLP(hidden, ACTS[cfg["activation"]])
    crit = nn.MSELoss()
    opt = torch.optim.Adam(model.parameters(), lr=cfg["lr"])
    best_val, best_ep, best_state = float("inf"), -1, None
    hist, t0 = [], time.time()
    for ep in range(cfg["epochs"]):
        model.train()
        tot = 0.0
        for xb, yb in loader:
            pred = model(xb)              # forward
            loss = crit(pred, yb)         # loss
            opt.zero_grad()               # zero_grad
            loss.backward()               # backward
            opt.step()                    # update
            tot += loss.item() * len(xb)
        model.eval()
        with torch.no_grad():
            val_loss = crit(model(Xva), Yva).item()
        hist.append((ep + 1, tot / len(Xtr), val_loss))
        if val_loss < best_val:
            best_val, best_ep, best_state = val_loss, ep + 1, copy.deepcopy(model.state_dict())
    train_time = time.time() - t0
    model.load_state_dict(best_state)      # khoi phuc checkpoint tot nhat theo validation
    if ckpt_path:
        torch.save({"state_dict": best_state, "hidden": list(hidden), "cfg": cfg,
                    "x_mean": sc.m, "x_std": sc.s}, ckpt_path)
    return model, sc, hist, dict(best_epoch=best_ep, train_time=train_time)


def evaluate_all(model, sc, data):
    out = {}
    for k in ["train", "val", "test"]:
        x, y = data[k]
        out[k] = metrics(y, predict(model, sc(x)))
    return out
