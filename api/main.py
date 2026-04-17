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