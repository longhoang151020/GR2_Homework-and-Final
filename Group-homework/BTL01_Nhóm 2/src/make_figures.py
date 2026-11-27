"""Xuat hinh + bang tong hop tu logs/results.csv. Chay: python src/make_figures.py"""
import os, sys, json
import numpy as np, pandas as pd, torch
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
sys.path.insert(0, os.path.dirname(__file__))
from data import load_all, gaussian_2d, RANGE_X1, RANGE_X2
from model import MLP
from train import ACTS, Scaler, predict, metrics

plt.rcParams.update({"font.size": 10, "axes.grid": True, "grid.alpha": .3, "figure.dpi": 130})
os.makedirs("figures", exist_ok=True)
data = load_all("data")
R = pd.read_csv("logs/results.csv")
S = {}   # so lieu cho bao cao


def agg(df, key):
    g = df.groupby(key)
    out = g.agg(**{f"{s}_{m}_{f}": (f"{s}_{m}", f) for s in ["train", "val", "test"] for m in ["mse", "mae", "rmse", "r2"] for f in ["mean", "std"]},
                time_mean=("train_time", "mean"), time_std=("train_time", "std"),
                ep_mean=("best_epoch", "mean")).reset_index()
    return out


# ---------- Hinh du lieu ----------
gx1, gx2 = np.meshgrid(np.linspace(*RANGE_X1, 60), np.linspace(*RANGE_X2, 60))
G = np.stack([gx1.ravel(), gx2.ravel()], 1); gz = gaussian_2d(G).reshape(gx1.shape)
fig = plt.figure(figsize=(12, 3.8))
for i, (k, c, t) in enumerate([("train", "tab:green", "Train (pool 2000)"), ("val", "tab:red", "Validation (200)"), ("test", "tab:blue", "Test (100)")]):
    ax = fig.add_subplot(1, 3, i + 1, projection="3d"); x, y = data[k]
    ax.scatter(x[:, 0], x[:, 1], y, c=c, s=4); ax.set_title(t); ax.set_xlabel("x1"); ax.set_ylabel("x2"); ax.set_zlabel("y")
plt.tight_layout(); plt.savefig("figures/fig_data_scatter3d.png"); plt.close()

fig = plt.figure(figsize=(5.5, 4.2)); ax = fig.add_subplot(111, projection="3d")
ax.plot_surface(gx1, gx2, gz, cmap="viridis", alpha=.9); ax.set_xlabel("x1"); ax.set_ylabel("x2"); ax.set_zlabel("f(x)")
plt.tight_layout(); plt.savefig("figures/fig_true_surface.png"); plt.close()

fig, ax = plt.subplots(1, 3, figsize=(11, 3.2))
xt, yt = data["train"]
for a, v, n in zip(ax, [xt[:, 0], xt[:, 1], yt], ["x1", "x2", "y = f(x1, x2)"]):
    a.hist(v, bins=30, color="steelblue", edgecolor="white"); a.set_xlabel(n); a.set_ylabel("Số mẫu")
plt.tight_layout(); plt.savefig("figures/fig_hist.png"); plt.close()
S["data"] = {"y_min": float(yt.min()), "y_max": float(yt.max()), "y_mean": float(yt.mean()), "y_std": float(yt.std()),
             "x1_mean": float(xt[:, 0].mean()), "x2_mean": float(xt[:, 1].mean()), "x1_std": float(xt[:, 0].std()), "x2_std": float(xt[:, 1].std()),
             "peak": float(gaussian_2d(np.zeros((1, 2)))[0]), "det": float(np.linalg.det(np.array([[.3, -.5], [-.5, 2]]))),
             "frac_below_1e-3": float((yt < 1e-3).mean()), "val_y_max": float(data["val"][1].max()), "test_y_max": float(data["test"][1].max())}


def curve(df, xcol, xlabel, fname, title, log=True, xticks=None):
    a = agg(df, xcol)
    fig, ax = plt.subplots(1, 2, figsize=(10.5, 3.8))
    for s, c, mk in [("train", "tab:green", "o"), ("val", "tab:red", "s"), ("test", "tab:blue", "^")]:
        ax[0].errorbar(a[xcol], a[f"{s}_mse_mean"], a[f"{s}_mse_std"], label=s, color=c, marker=mk, capsize=3, ms=4)
        ax[1].errorbar(a[xcol], a[f"{s}_mae_mean"], a[f"{s}_mae_std"], label=s, color=c, marker=mk, capsize=3, ms=4)
    for x_, yl in zip(ax, ["MSE", "MAE"]):
        x_.set_xlabel(xlabel); x_.set_ylabel(yl); x_.legend()
        if log: x_.set_yscale("log")
        if xticks is not None: x_.set_xticks(xticks)
    fig.suptitle(title); plt.tight_layout(); plt.savefig(fname); plt.close()
    return a


# ---------- A ----------
dA = R[R.exp == "A"]; aA = curve(dA, "A", "Số mẫu train A", "figures/fig_expA.png", "Thực nghiệm A: sai số theo số mẫu train (B=10, C=1)", xticks=range(200, 2001, 400))
aA.to_csv("logs/summary_A.csv", index=False)
# ---------- B ----------
dB = R[R.exp == "B"]; aB = curve(dB, "n_units", "Số nơ-ron tầng ẩn B", "figures/fig_expB.png", "Thực nghiệm B: sai số theo số nơ-ron (A=2000, C=1)")
aB.to_csv("logs/summary_B.csv", index=False)
dBs = R[R.exp == "Bsmall"]; aBs = curve(dBs, "n_units", "Số nơ-ron tầng ẩn B", "figures/fig_expB_small.png", "Bổ sung B-small: A=200, C=1")
aBs.to_csv("logs/summary_Bsmall.csv", index=False)
# ---------- C ----------
dC = R[R.exp == "C"]; aC = agg(dC, "n_layers"); aC.to_csv("logs/summary_C.csv", index=False)
H = pd.read_csv("logs/history.csv")
fig, ax = plt.subplots(1, 3, figsize=(13, 3.8))
for s, c, mk in [("train", "tab:green", "o"), ("val", "tab:red", "s"), ("test", "tab:blue", "^")]:
    ax[0].errorbar(aC.n_layers, aC[f"{s}_mse_mean"], aC[f"{s}_mse_std"], label=s, color=c, marker=mk, capsize=3, ms=4)
ax[0].set_yscale("log"); ax[0].set_xlabel("Số tầng ẩn C"); ax[0].set_ylabel("MSE"); ax[0].legend(); ax[0].set_xticks(aC.n_layers)
for cl in sorted(dC.n_layers.unique()):
    runs = [f"C_A2000_h{'-'.join(['10']*cl)}_s{s}" for s in [0, 1, 2]]
    hh = H[H.run.isin(runs)].groupby("epoch").val_loss.mean()
    ax[1].plot(hh.index, hh.values, label=f"C={cl}")
ax[1].set_yscale("log"); ax[1].set_xlabel("Epoch"); ax[1].set_ylabel("Validation MSE (TB 3 seed)"); ax[1].legend(ncol=2, fontsize=8)
ax[2].bar(aC.n_layers, aC.time_mean, yerr=aC.time_std, color="slategray", capsize=3); ax[2].set_xlabel("Số tầng ẩn C"); ax[2].set_ylabel("Thời gian train (s)"); ax[2].set_xticks(aC.n_layers)
plt.tight_layout(); plt.savefig("figures/fig_expC.png"); plt.close()

# ---------- Chon mo hinh cuoi theo VALIDATION ----------
cand = pd.concat([aB.assign(cfg="B", hidden=aB.n_units.map(lambda u: [int(u)])),
                  aC.assign(cfg="C", hidden=aC.n_layers.map(lambda c: [10] * int(c)))])
best = cand.sort_values("val_mse_mean").iloc[0]
hid = list(best.hidden); S["final_hidden"] = hid
sub = pd.concat([dB, dC]); sub = sub[sub.hidden == str(hid)].sort_values("val_mse"); seed = int(sub.iloc[0].seed)
name = f"{'B' if len(hid)==1 else 'C'}_A2000_h{'-'.join(map(str, hid))}_s{seed}"
ck = torch.load(f"checkpoints/{name}.pt", weights_only=False)
m = MLP(tuple(ck["hidden"]), ACTS[ck["cfg"]["activation"]]); m.load_state_dict(ck["state_dict"])
sc = Scaler(data["train"][0][:2000]); sc.m, sc.s = ck["x_mean"], ck["x_std"]
final = {}
for k in ["train", "val", "test"]:
    x, y = data[k]; final[k] = metrics(y, predict(m, sc(x)))
S["final"] = final; S["final_name"] = name; S["final_seed"] = seed
pd.DataFrame(final).T.to_csv("logs/final_model_metrics.csv")
import shutil; shutil.copy(f"checkpoints/{name}.pt", "checkpoints/best_model.pt")

fig, ax = plt.subplots(1, 3, figsize=(13, 4))
for a, k, c in zip(ax, ["train", "val", "test"], ["tab:green", "tab:red", "tab:blue"]):
    x, y = data[k]; yh = predict(m, sc(x)); a.scatter(y, yh, s=8, c=c)
    lim = [0, max(y.max(), yh.max()) * 1.05]; a.plot(lim, lim, "k--", lw=1); a.set_xlabel("y thật"); a.set_ylabel("y dự đoán"); a.set_title(f"{k}: MSE={final[k]['mse']:.2e}, R2={final[k]['r2']:.3f}")
plt.tight_layout(); plt.savefig("figures/fig_y_vs_yhat.png"); plt.close()

Z = predict(m, sc(G.astype(np.float32))).reshape(gx1.shape)
fig = plt.figure(figsize=(13, 4))
ax = fig.add_subplot(131, projection="3d"); ax.plot_surface(gx1, gx2, gz, cmap="viridis"); ax.set_title("Bề mặt thật f(x)")
ax = fig.add_subplot(132, projection="3d"); ax.plot_surface(gx1, gx2, Z, cmap="plasma"); ax.set_title("Bề mặt xấp xỉ (MLP)")
xtest, ytest = data["test"]
ax.scatter(xtest[:, 0], xtest[:, 1], ytest, c="k", s=5)
for a in fig.axes: a.set_xlabel("x1"); a.set_ylabel("x2"); a.set_zlabel("y")
ax = fig.add_subplot(133); im = ax.contourf(gx1, gx2, np.abs(Z - gz), 20, cmap="magma"); plt.colorbar(im, ax=ax); ax.set_title("|Sai số tuyệt đối|"); ax.set_xlabel("x1"); ax.set_ylabel("x2")
plt.tight_layout(); plt.savefig("figures/fig_surface_compare.png"); plt.close()
S["surface_max_abs_err"] = float(np.abs(Z - gz).max()); S["surface_mean_abs_err"] = float(np.abs(Z - gz).mean())

# so lieu cho bao cao
S["A"] = aA.to_dict("records"); S["B"] = aB.to_dict("records"); S["Bs"] = aBs.to_dict("records"); S["C"] = aC.to_dict("records")
S["n_runs"] = int(len(R)); S["epochs"] = int(R.epochs.iloc[0]); S["lr"] = float(R.lr.iloc[0]); S["bs"] = int(R.batch_size.iloc[0])
json.dump(S, open("logs/summary.json", "w"), indent=1, default=float)
print("OK", name, final["test"])
