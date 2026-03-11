from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import tensorflow as tf
import numpy as np
from PIL import Image
import io
import cv2
import os
import uuid

# -----------------------------
# CONFIG
# -----------------------------

IMG_SIZE = int(os.getenv("IMG_SIZE", "224"))
HEATMAP_DIR = os.getenv("HEATMAP_DIR", "heatmaps")
MODEL_PATH = os.getenv("MODEL_PATH", "dr_model.keras")

# New Labels for Multi-class classification
CATEGORIES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]

os.makedirs(HEATMAP_DIR, exist_ok=True)

# -----------------------------
# FASTAPI SETUP
# -----------------------------

app = FastAPI(
    title="RetinaAI Service",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/heatmaps", StaticFiles(directory=HEATMAP_DIR), name="heatmaps")

# -----------------------------
# LOAD MODEL
# -----------------------------

model = tf.keras.models.load_model(MODEL_PATH)

# -----------------------------
# IMAGE PREPROCESS
# -----------------------------

def preprocess(image: Image.Image):
    image = image.resize((IMG_SIZE, IMG_SIZE))
    img = np.array(image) / 255.0
    img = np.expand_dims(img, axis=0)
    return img

# -----------------------------
# FIND LAST CONV LAYER (For GradCAM)
# -----------------------------

def get_last_conv_layer():
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer
    return None

# -----------------------------
# GRAD CAM
# -----------------------------

def make_heatmap(img_array, class_index):
    try:
        last_conv_layer = get_last_conv_layer()
        if last_conv_layer is None:
            return np.ones((IMG_SIZE, IMG_SIZE))

        grad_model = tf.keras.models.Model(
            [model.inputs],
            [last_conv_layer.output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            # Target the specific predicted class for the heatmap
            loss = predictions[:, class_index]

        grads = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]

        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = np.maximum(heatmap, 0)

        if np.max(heatmap) != 0:
            heatmap /= np.max(heatmap)
        else:
            heatmap = np.ones((IMG_SIZE, IMG_SIZE))

        return heatmap.numpy()

    except Exception as e:
        print("GradCAM failed:", e)
        return np.ones((IMG_SIZE, IMG_SIZE))

# -----------------------------
# ROUTES
# -----------------------------

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Unable to read image file")

    try:
        img = preprocess(image)
        prediction = model.predict(img)
        
        # CHANGED LOGIC: Get the index of the highest probability
        class_index = int(np.argmax(prediction[0]))
        confidence = float(prediction[0][class_index])
        diagnosis = CATEGORIES[class_index]

        # -----------------------------
        # GENERATE HEATMAP
        # -----------------------------
        # --- GENERATE TRUE SUPERIMPOSED HEATMAP ---
        heatmap = make_heatmap(img, class_index)
        heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
        heatmap = np.uint8(255 * heatmap)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        # 1. Convert the original preprocessed image back to 0-255 range
        original_img = np.uint8(255 * img[0])
        original_img = cv2.cvtColor(original_img, cv2.COLOR_RGB2BGR)

        # 2. Superimpose the heatmap on original image (0.6 original + 0.4 heatmap)
        superimposed_img = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)

        filename = f"heatmap_{uuid.uuid4().hex}.jpg"
        heatmap_path = os.path.join(HEATMAP_DIR, filename)
        cv2.imwrite(heatmap_path, superimposed_img)
        return {
            "diagnosis": diagnosis,
            "class_id": class_index,
            "confidence": f"{confidence * 100:.2f}%",
            "heatmap": f"/heatmaps/{filename}",
            "probabilities": {CATEGORIES[i]: float(prediction[0][i]) for i in range(len(CATEGORIES))}
        }

    except Exception:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Prediction failed")