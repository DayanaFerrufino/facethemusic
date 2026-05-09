import cv2
import numpy as np
from tensorflow.keras.models import load_model
import os

# Load model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

model = load_model(os.path.join(BASE_DIR, "models", "emotion_model.keras"))
EMOTIONS = ['angry', 'fear', 'happy', 'neutral', 'sad', 'surprise']

# Load OpenCV face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def predict_emotion(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        # Crop and preprocess face
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48))
        face = face.astype('float32') / 255.0
        face = np.expand_dims(face, axis=-1)
        face = np.expand_dims(face, axis=0)

        # Predict
        predictions = model.predict(face, verbose=0)
        emotion = EMOTIONS[np.argmax(predictions)]
        confidence = np.max(predictions)

        # Draw bounding box and label
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, f"{emotion} ({confidence:.2f})", (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    return frame

# Run webcam
cap = cv2.VideoCapture(0)
print("Press 'q' to quit")

def predict_emotion_from_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    if len(faces) == 0:
        return None

    (x, y, w, h) = faces[0]
    face = gray[y:y+h, x:x+w]
    face = cv2.resize(face, (48, 48))
    face = face.astype('float32') / 255.0
    face = np.expand_dims(face, axis=-1)
    face = np.expand_dims(face, axis=0)

    predictions = model.predict(face, verbose=0)
    emotion = EMOTIONS[np.argmax(predictions)]
    return emotion

cap.release()
cv2.destroyAllWindows()