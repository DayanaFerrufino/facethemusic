# Face The Music

Face The Music is a full-stack emotion-based music recommendation app. The app uses a webcam image to detect the user's facial emotion, then generates a playlist that matches the detected mood. The frontend is built with React and Vite, while the backend uses FastAPI, OpenCV, and a TensorFlow/Keras emotion detection model.

### Course Information
**By:** Chenilyn Joy Espineda and Dayana Ferrufino<br>
**Course:** COSC 474-101<br>
**Instructor:** Dr. Md Kamruzzaman Sarker

<br>

---

## 💻 Tech Stack
* Python
* TensorFlow / Keras
* OpenCV
* FastAPI
* Uvicorn
* NumPy
* React
* Vite
* JavaScript
* CSS
* Node.js
* npm
* Deezer API
* iTunes Search API
* FER-2013 facial emotion dataset

<br>

---

## 🛠️ Setup Steps

### Step 1: Clone this Repository
Run the following to download the project from GitHub to your local machine:
```bash
git clone https://github.com/chlyn/facethemusic.git
cd facethemusic
```

<br>

### Step 2: Create a Python Virtual Environment
Create and activate a virtual environment for the backend and machine learning dependencies:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

If you are on Windows, activate the virtual environment with:
```bash
.venv\Scripts\activate
```

<br>

### Step 3: Install Python Packages
Install the required Python packages:
```bash
pip install --upgrade pip
pip install tensorflow opencv-python fastapi uvicorn python-multipart numpy scipy pillow kagglehub
```

These packages are used for model training, image processing, the backend API, and file uploads from the frontend.

<br>

### Step 4: Install Frontend Packages
Go into the frontend folder and install the React/Vite dependencies:
```bash
cd frontend
npm install
cd ..
```

<br>

### Step 5: Prepare the Facial Emotion Dataset
This project expects the facial emotion dataset to be placed inside a `data` folder with this structure:
```bash
data/
  train/
    angry/
    disgust/
    fear/
    happy/
    neutral/
    sad/
    surprise/
  test/
    angry/
    disgust/
    fear/
    happy/
    neutral/
    sad/
    surprise/
```

The model was trained using the FER-2013 facial emotion dataset. Download the dataset from Kaggle, then place the training images in `data/train` and testing images in `data/test`.

You can also download and copy the dataset from the terminal with `kagglehub`:
```bash
python -c "import kagglehub, shutil, pathlib; dataset = pathlib.Path(kagglehub.dataset_download('msambare/fer2013')); pathlib.Path('data').mkdir(exist_ok=True); shutil.copytree(dataset / 'train', 'data/train', dirs_exist_ok=True); shutil.copytree(dataset / 'test', 'data/test', dirs_exist_ok=True)"
```

After running the command, confirm the folders exist:
```bash
ls data/train
ls data/test
```

If the downloaded dataset uses a folder named `validation`, rename it to `test` so it matches the training script:
```bash
mv data/validation data/test
```

<br>

### Step 6: Create the Models Folder
The trained emotion model is saved into the `models` folder:
```bash
mkdir -p models
```

<br>

### Step 7: Train the Emotion Model
Train the TensorFlow/Keras emotion classifier:
```bash
python src/train.py
```

After training finishes, the model will be saved here:
```bash
models/emotion_model.keras
```

This file is required before running the backend because the API loads the trained model when it starts.

<br>

### Step 8: Check the Backend
Start the FastAPI backend:
```bash
python -m uvicorn api.main:app --reload
```

Then open this URL in your browser:
```bash
http://localhost:8000
```

You should see a response similar to:
```json
{
  "status": "facethemusic API running"
}
```

Stop the backend with `CTRL + C` before continuing if you want to use the automatic start command.

<br>

### Step 9: Check the Frontend
In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

Then open:
```bash
http://localhost:5173
```

<br>

---

## ▶️ How to Run the App

### Option 1: Run Everything Automatically
From the root of the project, run:
```bash
npm start
```

This starts:
* The FastAPI backend on `http://localhost:8000`
* The Vite React frontend on `http://localhost:5173`
* The browser automatically opens to the frontend

Make sure your virtual environment is activated before running this command:
```bash
source .venv/bin/activate
npm start
```

<br>

### Option 2: Run Backend and Frontend Manually
Terminal 1: start the backend:
```bash
source .venv/bin/activate
python -m uvicorn api.main:app --reload
```

Terminal 2: start the frontend:
```bash
cd frontend
npm run dev
```

Then open:
```bash
http://localhost:5173
```

<br>

---

## 🎵 How the App Works

### Step 1: Camera Access
The user allows camera access in the browser. The camera page displays the live webcam feed and checks whether a face is visible.

<br>

### Step 2: Emotion Detection
When the user clicks `Generate playlist`, the frontend captures an image from the webcam and sends it to the FastAPI backend.

The backend:
* Reads the uploaded image
* Uses OpenCV to detect a face
* Crops and resizes the face to `48x48`
* Sends the face image through the trained TensorFlow/Keras model
* Returns the predicted emotion

<br>

### Step 3: Playlist Generation
After detecting the emotion, the backend searches for music using emotion-based search terms. Deezer is used to find playlist tracks, and the iTunes Search API is used to fetch playable preview URLs and album artwork.

<br>

### Step 4: Music Player
The frontend displays:
* The detected emotion
* The matching emotion image
* A generated playlist
* Album artwork
* Preview playback controls
* A scan again button

<br>

---

## 📁 Project Structure

```bash
facethemusic/
  api/
    main.py
  src/
    model.py
    predict.py
    recommend.py
    train.py
  frontend/
    src/
      assets/
      pages/
      styles/
    package.json
  data/
    train/
    test/
  models/
    emotion_model.keras
  scripts/
    start-dev.mjs
  package.json
  README.md
```

<br>

---

## ✅ Notes

* The `data` and `models` folders are not committed to GitHub because they can be large.
* If `npm start` says port `8000` is already in use, stop the old backend process and run the command again.
* The browser may ask for camera permission. The camera feature will not work unless access is allowed.
* Emotion detection accuracy depends on lighting, camera quality, face position, and the trained model accuracy.
