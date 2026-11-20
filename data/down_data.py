from pathlib import Path 
import gdown 

BASE_DIR = Path("/mnt/data/sudent_feedback_sentiment/student-feedback-sentiment/data/type_txt")

FILES = {
        "train": {
        "sentences": "https://drive.google.com/uc?id=1nzak5OkrheRV1ltOGCXkT671bmjODLhP&export=download",
        "sentiments": "https://drive.google.com/uc?id=1ye-gOZIBqXdKOoi_YxvpT6FeRNmViPPv&export=down load",
        "topics": "https://drive.google.com/uc?id=14MuDtwMnNOcr4z_8KdpxprjbwaQ7lJ_C&export=download",
    },
    "validation": {
        "sentences": "https://drive.google.com/uc?id=1sMJSR3oRfPc3fe1gK-V3W5F24tov_517&export=download",
        "sentiments": "https://drive.google.com/uc?id=1GiY1AOp41dLXIIkgES4422AuDwmbUseL&export=download",
        "topics": "https://drive.google.com/uc?id=1DwLgDEaFWQe8mOd7EpF-xqMEbDLfdT-W&export=download",
    },
    "test": 
        {
        "sentences": "https://drive.google.com/uc?id=1aNMOeZZbNwSRkjyCWAGtNCMa3YrshR-n&export=download",
        "sentiments": "https://drive.google.com/uc?id=1vkQS5gI0is4ACU58-AbWusnemw7KZNfO&export=download",
        "topics": "https://drive.google.com/uc?id=1_ArMpDguVsbUGl-xSMkTF_p5KpZrmpSB&export=download",
    },
}

for split,files in FILES.items():
    outputs_dir = BASE_DIR / split 
    outputs_dir.mkdir(parents=True, exist_ok =True)

    for name, file_id in files.items(): 
        output = outputs_dir/ f"{name}.txt"
        gdown.download(
            url=  file_id,
            output = str(output),
            quiet = False
        )
print("Download completed!!")