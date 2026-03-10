import os
import shutil
import pandas as pd

CSV_PATH = "train.csv"
IMG_DIR = "train_images"
OUT_DIR = "dataset/diabetes"

os.makedirs(f"{OUT_DIR}/no", exist_ok=True)
os.makedirs(f"{OUT_DIR}/yes", exist_ok=True)

df = pd.read_csv(CSV_PATH)

for _, row in df.iterrows():
    img_id = row["id_code"]
    label = row["diagnosis"]

    src = os.path.join(IMG_DIR, img_id + ".png")

    if not os.path.exists(src):
        continue

    if label == 0:
        dst = os.path.join(OUT_DIR, "no", img_id + ".png")
    else:
        dst = os.path.join(OUT_DIR, "yes", img_id + ".png")

    shutil.copy(src, dst)

print("Dataset prepared!")