import cv2
import numpy as np
from tensorflow.keras.models import load_model
from collections import deque, Counter
import os

# Find the project root so the model path works from different commands.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load the trained emotion model once when the backend starts.
model = load_model(os.path.join(BASE_DIR, "models", "emotion_model.keras"))

# Emotion labels must match the order used during model training.
EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

# OpenCV face detector finds the face area before emotion prediction.
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Stores recent predictions so the app does not jump between emotions too quickly.
_emotion_history = deque(maxlen=7)

def get_stable_emotion(history):
    # If there is no history yet, use neutral as a safe default.
    if not history:
        return "neutral"

    # Count recent predictions and find the most common emotion.
    counts = Counter(history)
    top, top_count = counts.most_common(1)[0]

    # Only switch emotions if the same one appears often enough.
    if top_count >= 5:
        return top

    # Otherwise keep the newest prediction to avoid sudden unstable changes.
    return history[-1]

def predict_emotion(frame):
    # Convert to grayscale because the model and face detector expect grayscale.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        # Crop the detected face and resize it to match the model input.
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))

        # Normalize pixels and add batch/channel dimensions for Keras.
        face = face.astype('float32') / 255.0
        face = np.expand_dims(face, axis=-1)
        face = np.expand_dims(face, axis=0)

        # Predict emotion probabilities and choose the highest one.
        predictions = model.predict(face, verbose=0)
        emotion = EMOTIONS[np.argmax(predictions)]
        confidence = np.max(predictions)

        # Draw the result on the frame for debugging or local webcam testing.
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, f"{emotion} ({confidence:.2f})", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    return frame

def predict_emotion_from_frame(frame):
    # This function returns only the emotion label for the API.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    # If no face is found, the backend should not generate a playlist.
    if len(faces) == 0:
        return None

    # Use the first detected face for prediction.
    (x, y, w, h) = faces[0]
    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (48, 48))

    # Prepare the face image in the same format used during training.
    face = face.astype('float32') / 255.0
    face = np.expand_dims(face, axis=-1)
    face = np.expand_dims(face, axis=0)

    # Run the model and get the emotion with the highest probability.
    predictions = model.predict(face, verbose=0)
    probs = predictions[0].copy()

    confidence = float(np.max(probs))
    emotion = EMOTIONS[np.argmax(probs)]

    # Add the prediction to history and return a smoother stable emotion.
    _emotion_history.append(emotion)
    return get_stable_emotion(_emotion_history)
