"""MLP tuy bien so tang an va so no-ron moi tang."""
import torch.nn as nn


class MLP(nn.Module):
    def __init__(self, hidden_sizes=(10,), activation=nn.Tanh):
        super().__init__()
        layers, in_dim = [], 2
        for h in hidden_sizes:
            layers += [nn.Linear(in_dim, h), activation()]
            in_dim = h
        layers.append(nn.Linear(in_dim, 1))   # dau ra tuyen tinh (hoi quy)
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x).squeeze(-1)
