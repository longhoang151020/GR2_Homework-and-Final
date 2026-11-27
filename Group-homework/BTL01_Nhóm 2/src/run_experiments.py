"""Chay thuc nghiem A/B/C. Vi du: python src/run_experiments.py --exp A B C Bsmall
Moi lan chay duoc ghi vao logs/results.csv (co the chay lai, se bo qua cac run da xong)."""
import argparse, os, sys
import pandas as pd
sys.path.insert(0, os.path.dirname(__file__))
from data import load_all
from train import fit, evaluate_all, DEFAULT

SEEDS = [0, 1, 2]
POOL = 2000
CFG = {
    "A":      [dict(A=a, hidden=(10,)) for a in range(200, 2001, 200)],
    "B":      [dict(A=POOL, hidden=(b,)) for b in list(range(1, 11)) + [16, 32]],
    "Bsmall": [dict(A=200, hidden=(b,)) for b in list(range(1, 11)) + [16, 32]],   # bo sung: du lieu it -> quan sat overfit
    "C":      [dict(A=POOL, hidden=(10,) * c) for c in range(1, 7)],
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--exp", nargs="+", default=["A", "B", "C", "Bsmall"])
    args = ap.parse_args()
    os.makedirs("logs", exist_ok=True); os.makedirs("checkpoints", exist_ok=True)
    data = load_all("data")
    res_path, hist_path = "logs/results.csv", "logs/history.csv"
    done = set()
    if os.path.exists(res_path):
        d = pd.read_csv(res_path); done = set(zip(d.exp, d.A, d.hidden, d.seed))
    for exp in args.exp:
        for c in CFG[exp]:
            for seed in SEEDS:
                key = (exp, c["A"], str(list(c["hidden"])), seed)
                if key in done: continue
                xtr, ytr = data["train"][0][:c["A"]], data["train"][1][:c["A"]]   # tap con long nhau
                name = f"{exp}_A{c['A']}_h{'-'.join(map(str, c['hidden']))}_s{seed}"
                model, sc, hist, info = fit(c["hidden"], xtr, ytr, *data["val"], seed=seed,
                                            ckpt_path=f"checkpoints/{name}.pt")
                ev = evaluate_all(model, sc, data)
                row = dict(exp=exp, A=c["A"], hidden=str(list(c["hidden"])), n_layers=len(c["hidden"]),
                           n_units=c["hidden"][0], seed=seed, **{f"{k}_{m}": v for k, s in ev.items() for m, v in s.items()},
                           **info, **{k: v for k, v in DEFAULT.items()})
                pd.DataFrame([row]).to_csv(res_path, mode="a", header=not os.path.exists(res_path), index=False)
                h = pd.DataFrame(hist, columns=["epoch", "train_loss", "val_loss"]); h.insert(0, "run", name)
                h.to_csv(hist_path, mode="a", header=not os.path.exists(hist_path), index=False)
                print(name, f"val={ev['val']['mse']:.2e} test={ev['test']['mse']:.2e} t={info['train_time']:.1f}s", flush=True)


if __name__ == "__main__":
    main()
