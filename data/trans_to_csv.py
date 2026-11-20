import pandas as pd 
from pathlib import Path 

BASE_DIR = Path("/mnt/data/sudent_feedback_sentiment/student-feedback-sentiment/data")

def load_split(split): 
    path = BASE_DIR / "type_txt" / split 

    df = pd.DataFrame({
        "sentence" : (path / "sentences.txt").read_text(encoding= "utf-8").splitlines(),
        "sentiment" : (path/"sentiments.txt").read_text(encoding = "utf-8").splitlines(),
        "topic" : (path/"topics.txt").read_text(encoding= "utf-8").splitlines()
    }
    )

    df["sentiment"] = df["sentiment"].astype(int)
    df["topic"] = df["topic"].astype(int)

    return df 

train_df = load_split("train")
val_df = load_split("validation")
test_df = load_split("test") 

names = {"train":train_df,"validation":val_df,"test":test_df}

for keys, values in names.items(): 
    path_ = BASE_DIR / keys 
    path_.mkdir(parents = True, exist_ok = True)

    values.to_csv(path_ / f"{keys}.csv",index= False)



# train_df.to_csv(BASE_DIR / "train.csv", index=False)
# val_df.to_csv(BASE_DIR / "validation.csv", index=False)
# test_df.to_csv(BASE_DIR / "test.csv", index=False) 

print(train_df.head())