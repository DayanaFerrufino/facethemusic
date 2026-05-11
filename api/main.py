from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import sys
import os

# Adds the src folder to Python's path so the API can use the ML model and recommender.
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from predict import predict_emotion_from_frame
from recommend import get_recommendations

# FastAPI creates the backend server that receives images and returns emotions/playlists.
app = FastAPI()

# OpenCV Haar Cascade detects whether a face is visible before running emotion prediction.
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# CORS allows the React app on localhost:5173 to call the backend on localhost:8000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    # Health check route used to confirm the API started correctly.
    return {"status": "facethemusic API running"}

@app.post("/detect-face")
async def detect_face(file: UploadFile = File(...)):
    # Read the uploaded camera frame and convert it into an OpenCV image.
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # If the image is invalid, return no face so the frontend can keep waiting.
    if frame is None:
        return {"has_face": False}

    # Convert to grayscale because Haar Cascade face detection works on grayscale images.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    has_face = len(faces) > 0

    # Only predict emotion when a face is found to avoid false emotion labels.
    emotion = predict_emotion_from_frame(frame) if has_face else None

    return {"has_face": has_face, "emotion": emotion}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Read the final captured image sent after the user clicks Generate playlist.
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Use the trained model to classify the user's facial emotion.
    emotion = predict_emotion_from_frame(frame)

    # If no emotion is detected, return an empty playlist instead of crashing.
    if not emotion:
        return {"emotion": None, "songs": []}

    # Use the recommender to create songs that match the detected emotion.
    songs = get_recommendations(emotion)

    return {"emotion": emotion, "songs": songs}