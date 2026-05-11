import { useEffect, useRef, useState } from "react";
import logo from "../assets/brand/logo.svg";
import catCamera from "../assets/camera/camera.svg";
import catEmotion from "../assets/camera/emotion.svg";
import catError from "../assets/camera/error.svg";
import catWait from "../assets/camera/wait.svg";
import angryIcon from "../assets/emotions/angry.png";
import disgustIcon from "../assets/emotions/disgust.png";
import fearIcon from "../assets/emotions/fear.png";
import happyIcon from "../assets/emotions/happy.png";
import neutralIcon from "../assets/emotions/neutral.png";
import sadIcon from "../assets/emotions/sad.png";
import surpriseIcon from "../assets/emotions/surprise.png";
import "../styles/pages/camera.css";

const API_URL = "http://localhost:8000";

// Maps each emotion name from the backend to the image shown in the UI.
const EMOTION_ICONS = {
  angry: angryIcon,
  disgust: disgustIcon,
  fear: fearIcon,
  happy: happyIcon,
  neutral: neutralIcon,
  sad: sadIcon,
  surprise: surpriseIcon,
};

function Camera({ onGeneratePlaylist, error, onPreviewEmotion }) {
  
  const videoRef = useRef(null);                                    // videoRef points to the live video element so we can read frames from it.
  const streamRef = useRef(null);                                   // streamRef stores the camera stream so we can stop it when leaving the page.
  const [ready, setReady] = useState(false);                        // Tracks whether the camera is ready to show and capture video.
  const [capturing, setCapturing] = useState(false);                // Prevents the user from clicking Generate playlist multiple times at once.
  const [cameraError, setCameraError] = useState("");               // Stores camera permission or device errors.
  const [hasFace, setHasFace] = useState(false);                    // Tracks whether the backend detected a face in the current camera frame.  
  const [detectedEmotion, setDetectedEmotion] = useState(null);     // Stores the live emotion preview returned by the backend.

  useEffect(() => {
    // Ask the browser for camera access when the camera page loads.
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Save the stream and connect it to the video element.
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      })
      .catch((err) => {
        // If camera access fails, show a clear message in the UI.
        console.error("Camera access failed:", err);
        setCameraError("Camera access was blocked or is unavailable");
      });

    return () => {
      // Stop the camera when the component closes so it does not keep running.
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    // Do not start face checks until the camera is ready and has no error.
    if (!ready || cameraError) return;

    let stopped = false;
    const abortRef = { current: null };

    const detectFace = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Make a smaller copy of the camera frame so face checks are faster.
      const scale = Math.min(1, 320 / video.videoWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Convert the frame to a JPEG blob so it can be sent to the backend.
        const blob = await new Promise(
          (resolve) => canvas.toBlob(resolve, "image/jpeg", 0.6),
        );
        if (!blob || stopped) return;

        // Cancel the previous face check if it is still running.
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        // FormData is used because the backend expects an uploaded image file.
        const formData = new FormData();
        formData.append("file", blob, "face-check.jpg");

        // Send the frame to the backend so it can detect a face and emotion.
        const response = await fetch(`${API_URL}/detect-face`, {
          method: "POST",
          body: formData,
          signal: abortRef.current.signal,
        });

        const data = await response.json();
        if (stopped) return;

        // Update the camera UI with the latest face and emotion result.
        const nextHasFace = Boolean(data.has_face);
        const nextEmotion = nextHasFace ? data.emotion || null : null;
        setHasFace(nextHasFace);
        setDetectedEmotion(nextEmotion);
        onPreviewEmotion?.(nextEmotion);
      } catch (err) {
        // AbortError is expected when a newer face check replaces an older one.
        if (err.name === "AbortError") return;

        // For other errors, reset the preview so the UI does not show stale data.
        console.error("Face detection failed:", err);
        if (!stopped) {
          setHasFace(false);
          setDetectedEmotion(null);
          onPreviewEmotion?.(null);
        }
      }
    };

    // Run one check immediately, then keep checking while the camera is open.
    detectFace();
    const intervalId = setInterval(detectFace, 600);

    return () => {
      // Stop the interval and any pending request when leaving the camera page.
      stopped = true;
      clearInterval(intervalId);
      abortRef.current?.abort();
    };
  }, [ready, cameraError, onPreviewEmotion]);

  const handleCapture = () => {
    // Do nothing if the camera is not ready or a capture is already in progress.
    if (!videoRef.current || capturing || !ready) return;
    setCapturing(true);

    // Copy the current video frame into a canvas so it can become an image file.
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        // Send the captured image to App.jsx so it can request a playlist.
        onGeneratePlaylist(blob);
      },
      "image/jpeg",
      0.95,
    );
  };

  return (
    <main className="camera-page">
      <div className="topbar">
        <img className="topbar-logo" src={logo} alt="Face the Music logo" />
        <h1 className="topbar-title">Face The Music</h1>
      </div>

      <div
        className={`content${ready ? " content--ready" : " content--waiting"}`}
      >
        <div className="camera">
          {/* Show camera error, waiting state, or live camera feed. */}
          {cameraError ? (
            <div className="camera-container-error">
              <img src={catError} alt="" className="camera-error-icon" />
              <p>{cameraError}</p>
            </div>
          ) : !ready ? (
            <div className="camera-container-waiting">
              <img src={catWait} alt="" className="camera-waiting-icon" />
              <p>Waiting for camera access...</p>
            </div>
          ) : (
            <>
              {/* Live webcam preview. */}
              <video
                ref={videoRef}
                className="camera-feed"
                autoPlay
                playsInline
                muted
              />

              <div className="camera-overlay">
                <div className="face-frame">
                  {/* Frame corners guide the user where to position their face. */}
                  <span className="frame-corner top-left" />
                  <span className="frame-corner top-right" />
                  <span className="frame-corner bottom-left" />
                  <span className="frame-corner bottom-right" />

                  {/* Show instructions only when no face is detected. */}
                  {!hasFace && (
                    <div className="camera-instruction">
                      <img
                        className="camera-instruction-icon"
                        src={catCamera}
                        alt=""
                      />
                      <p>Center your face in the frame</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Emotion preview panel appears after the camera is ready. */}
        {ready && (
          <div
            className={`camera-emotion${
              detectedEmotion ? " camera-emotion--detected" : ""
            }`}
          >
            <img
              src={
                detectedEmotion
                  ? EMOTION_ICONS[detectedEmotion] || catEmotion
                  : catEmotion
              }
              alt=""
              className="camera-emotion-icon"
            />
            <p>
              {detectedEmotion
                ? `${detectedEmotion}`
                : "Your emotion will appear here after scan"}
            </p>
          </div>
        )}
      </div>

      {error && <p className="camera-error">{error}</p>}

      {/* Button captures the current frame and starts playlist generation. */}
      <button
        className={`button${!ready || capturing ? " button--disabled" : ""}`}
        onClick={handleCapture}
        disabled={!ready || capturing}
      >
        {capturing ? "Analysing..." : "Generate playlist"}
      </button>
    </main>
  );
}

export default Camera;
