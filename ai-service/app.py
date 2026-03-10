# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# import tensorflow as tf
# import numpy as np
# from PIL import Image
# import io, cv2, os, uuid

# IMG_SIZE = int(os.getenv("IMG_SIZE", "224"))
# HEATMAP_DIR = os.getenv("HEATMAP_DIR", "heatmaps")
# MODEL_PATH = os.getenv("MODEL_PATH", "dr_grading_model_v2_finetuned (1).keras")
# THRESHOLD = float(os.getenv("PREDICTION_THRESHOLD", "0.5"))

# os.makedirs(HEATMAP_DIR, exist_ok=True)

# app = FastAPI(title="RetinaAI Service", version="1.0.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.mount("/heatmaps", StaticFiles(directory=HEATMAP_DIR), name="heatmaps")

# model = tf.keras.models.load_model(MODEL_PATH)


# def preprocess(image: Image.Image) -> np.ndarray:
#     image = image.resize((IMG_SIZE, IMG_SIZE))
#     img = np.array(image) / 255.0
#     img = np.expand_dims(img, axis=0)
#     return img


# def make_heatmap(img_array: np.ndarray) -> np.ndarray:
#     """
#     Best-effort Grad-CAM.
#     If anything fails (layer naming, shapes, etc.), fall back to a uniform heatmap
#     so that prediction can still succeed.
#     """
#     try:
#         last_conv = model.layers[-3]
#         grad_model = tf.keras.models.Model(
#             [model.inputs], [last_conv.output, model.output]
#         )

#         with tf.GradientTape() as tape:
#             conv_outputs, predictions = grad_model(img_array)
#             loss = predictions[:, 0]

#         grads = tape.gradient(loss, conv_outputs)
#         pooled = tf.reduce_mean(grads, axis=(0, 1, 2))

#         conv_outputs = conv_outputs[0]
#         heatmap = conv_outputs @ pooled[..., tf.newaxis]
#         heatmap = tf.squeeze(heatmap)
#         denom = np.max(heatmap)
#         if denom == 0:
#             # Avoid division by zero; return non-informative uniform map
#             return np.ones((IMG_SIZE, IMG_SIZE), dtype=np.float32)
#         heatmap = np.maximum(heatmap, 0) / denom
#         return heatmap.numpy()
#     except Exception as exc:  # pragma: no cover - best-effort fallback
#         print(f"Grad-CAM generation failed, using uniform heatmap: {exc}", flush=True)
#         return np.ones((IMG_SIZE, IMG_SIZE), dtype=np.float32)


# @app.get("/health")
# async def health():
#     return {"status": "ok"}


# @app.post("/predict")
# async def predict(file: UploadFile = File(...)):
#     if not file.content_type or not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Only image files are supported")

#     try:
#         contents = await file.read()
#         image = Image.open(io.BytesIO(contents)).convert("RGB")
#     except Exception:
#         raise HTTPException(status_code=400, detail="Unable to read image file")

#     try:
#         img = preprocess(image)
#         pred = float(model.predict(img)[0][0])

#         # Heatmap
#         heatmap = make_heatmap(img)
#         heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))
#         heatmap = np.uint8(255 * heatmap)
#         heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

#         filename = f"heatmap_{uuid.uuid4().hex}.jpg"
#         heatmap_path = os.path.join(HEATMAP_DIR, filename)
#         cv2.imwrite(heatmap_path, heatmap)

#         return {
#             "disease": pred > THRESHOLD,
#             "confidence": pred,
#             "threshold": THRESHOLD,
#             "heatmap": f"/heatmaps/{filename}",
#             "model_path": MODEL_PATH,
#         }
#     except HTTPException:
#         raise
#     except Exception as exc:
#         # Log full error server-side and return a generic message to the client
#         import traceback  # local import to avoid top-level dependency

#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail="Prediction failed")



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
MODEL_PATH = os.getenv("MODEL_PATH", "dr_grading_model_v2_finetuned (1).keras")
THRESHOLD = float(os.getenv("PREDICTION_THRESHOLD", "0.5"))

os.makedirs(HEATMAP_DIR, exist_ok=True)


# -----------------------------
# FASTAPI SETUP
# -----------------------------

app = FastAPI(
    title="RetinaAI Service",
    version="1.0.0"
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
# FIND LAST CONV LAYER
# -----------------------------

def get_last_conv_layer():

    for layer in reversed(model.layers):

        if isinstance(layer, tf.keras.layers.Conv2D):

            return layer

    return None


# -----------------------------
# GRAD CAM
# -----------------------------

def make_heatmap(img_array):

    try:

        last_conv_layer = get_last_conv_layer()

        if last_conv_layer is None:

            print("No conv layer found. Using fallback heatmap")

            return np.ones((IMG_SIZE, IMG_SIZE))


        grad_model = tf.keras.models.Model(

            [model.inputs],

            [last_conv_layer.output, model.output]

        )


        with tf.GradientTape() as tape:

            conv_outputs, predictions = grad_model(img_array)

            loss = predictions[:, 0]


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
# HEALTH CHECK
# -----------------------------

@app.get("/health")
async def health():

    return {"status": "ok"}


# -----------------------------
# PREDICT
# -----------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):

        raise HTTPException(
            status_code=400,
            detail="Only image files are supported"
        )

    try:

        contents = await file.read()

        image = Image.open(io.BytesIO(contents)).convert("RGB")

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Unable to read image file"
        )

    try:

        img = preprocess(image)

        prediction = model.predict(img)

        pred = float(prediction[0][0])


        # -----------------------------
        # GENERATE HEATMAP
        # -----------------------------

        heatmap = make_heatmap(img)

        heatmap = cv2.resize(heatmap, (IMG_SIZE, IMG_SIZE))

        heatmap = np.uint8(255 * heatmap)

        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)


        filename = f"heatmap_{uuid.uuid4().hex}.jpg"

        heatmap_path = os.path.join(HEATMAP_DIR, filename)

        cv2.imwrite(heatmap_path, heatmap)


        return {

            "disease": pred > THRESHOLD,

            "confidence": pred,

            "threshold": THRESHOLD,

            "heatmap": f"/heatmaps/{filename}",

            "model_path": MODEL_PATH

        }


    except Exception:

        import traceback

        traceback.print_exc()

        raise HTTPException(

            status_code=500,

            detail="Prediction failed"

        )