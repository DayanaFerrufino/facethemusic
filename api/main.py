from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from predict import predict_emotion_from_frame
from recommend import get_recommendations

app = FastAPI()
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# Allow React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "facethemusic API running"}

@app.post("/detect-face")
async def detect_face(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"has_face": False}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    has_face = len(faces) > 0
    emotion = predict_emotion_from_frame(frame) if has_face else None

    return {"has_face": has_face, "emotion": emotion}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Read image from frontend
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Get emotion
    emotion = predict_emotion_from_frame(frame)

    if not emotion:
        return {"emotion": None, "songs": []}

    # Get song recommendations
    songs = get_recommendations(emotion)

    return {"emotion": emotion, "songs": songs}