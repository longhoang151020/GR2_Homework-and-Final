"""Sinh, luu, doc du lieu Gaussian 2 chieu."""
import os
import numpy as np
import pandas as pd

MU = np.array([0.0, 0.0])
COV = np.array([[0.3, -0.5], [-0.5, 2.0]])
RANGE_X1 = (-2.0, 2.0)
RANGE_X2 = (-4.0, 4.0)

# Seed co dinh cho tung tap -> 3 tap doc lap, tai lap duoc
SEED_TRAIN, SEED_VAL, SEED_TEST = 42, 1042, 2042
N_POOL, N_VAL, N_TEST = 2000, 200, 100


def gaussian_2d(x, mu=MU, cov=COV):
    """f(x) = 1/((2pi)^{n/2} det(C)^{1/2}) exp(-0.5 (x-mu)^T C^-1 (x-mu)); x: (N,2)."""
    n = len(mu)
    d = x - mu
    inv = np.linalg.inv(cov)
    maha = np.einsum("ni,ij,nj->n", d, inv, d)
    norm = 1.0 / (((2 * np.pi) ** (n / 2)) * np.sqrt(np.linalg.det(cov)))
    return norm * np.exp(-0.5 * maha)


def generate(n, seed):
    rng = np.random.default_rng(seed)
    x1 = rng.uniform(*RANGE_X1, n)
    x2 = rng.uniform(*RANGE_X2, n)
    x = np.stack([x1, x2], axis=1)
    return x, gaussian_2d(x)


def make_and_save(data_dir="data"):
    os.makedirs(data_dir, exist_ok=True)
    for name, n, seed in [("train", N_POOL, SEED_TRAIN), ("val", N_VAL, SEED_VAL), ("test", N_TEST, SEED_TEST)]:
        x, y = generate(n, seed)
        pd.DataFrame({"x1": x[:, 0], "x2": x[:, 1], "y": y}).to_csv(f"{data_dir}/{name}.csv", index=False)


def load_csv(path):
    df = pd.read_csv(path)
    return df[["x1", "x2"]].values.astype(np.float32), df["y"].values.astype(np.float32)


def load_all(data_dir="data"):
    if not os.path.exists(f"{data_dir}/train.csv"):
        make_and_save(data_dir)
    return {k: load_csv(f"{data_dir}/{k}.csv") for k in ["train", "val", "test"]}


if __name__ == "__main__":
    make_and_save()
    print("Da tao data/train.csv, val.csv, test.csv")
