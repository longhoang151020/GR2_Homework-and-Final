# BTL01 - Xap xi ham Gaussian 2 chieu bang MLP (PyTorch)

## Cai dat
    python -m venv venv && source venv/bin/activate     # (tuy chon)
    pip install -r requirements.txt

## Cau truc thu muc
    src/data.py             sinh/luu/doc du lieu (Gaussian 2D, seed co dinh)
    src/model.py            MLP(nn.Module): tuy chinh so tang an, so no-ron/tang
    src/train.py            vong lap train/validation, checkpoint theo val loss, MSE/MAE/RMSE/R2
    src/run_experiments.py  chay thuc nghiem A, B, C (+ B-small bo sung); ghi logs/results.csv
    src/make_figures.py     xuat hinh, bang tong hop, chon mo hinh cuoi
    data/                   train.csv (pool 2000), val.csv (200), test.csv (100)
    logs/                   results.csv (tung lan chay), history.csv (loss theo epoch), summary_*.csv
    figures/                hinh bieu do
    checkpoints/            trong so .pt cua tung lan chay; best_model.pt la mo hinh cuoi
    report/                 bao cao .docx/.pdf

## Lenh chay (chay tu thu muc goc)
    python src/data.py                                   # sinh du lieu (seed 42/1042/2042)
    python src/run_experiments.py --exp A                # thuc nghiem A
    python src/run_experiments.py --exp B Bsmall         # thuc nghiem B (+ B-small)
    python src/run_experiments.py --exp C                # thuc nghiem C
    python src/make_figures.py                           # hinh + bang + mo hinh cuoi

## Thiet lap chuan (baseline)
Adam, lr=0.01, batch 64, 300 epoch (khong early stopping, chon checkpoint co val loss nho nhat),
kich hoat Tanh, dau ra tuyen tinh, MSELoss, chuan hoa dau vao theo thong ke tap train, 3 seed (0,1,2).
Test chi dung de danh gia cuoi; viec chon cau hinh dua tren validation.

## Thanh vien va ty le dong gop
| Thanh vien | MSSV | Nhiem vu | Ty le |
|---|---|---|---|
| (dien) | | | % |
| Tong | | | 100% |
