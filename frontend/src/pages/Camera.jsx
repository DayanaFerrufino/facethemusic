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
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [hasFace, setHasFace] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setReady(true);
      })
      .catch((err) => {
        console.error("Camera access failed:", err);
        setCameraError("Camera access was blocked or is unavailable");
      });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!ready || cameraError) return;

    let stopped = false;
    const abortRef = { current: null };

    const detectFace = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      // Scale down to max 320px wide
      const scale = Math.min(1, 320 / video.videoWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const blob = await new Promise(
          (resolve) => canvas.toBlob(resolve, "image/jpeg", 0.6), // lower quality is fine for detection
        );
        if (!blob || stopped) return;

        // Cancel the previous request if it's still pending
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const formData = new FormData();
        formData.append("file", blob, "face-check.jpg");

        const response = await fetch(`${API_URL}/detect-face`, {
          method: "POST",
          body: formData,
          signal: abortRef.current.signal,
        });

        const data = await response.json();
        if (stopped) return;

        const nextHasFace = Boolean(data.has_face);
        const nextEmotion = nextHasFace ? data.emotion || null : null;
        setHasFace(nextHasFace);
        setDetectedEmotion(nextEmotion);
        onPreviewEmotion?.(nextEmotion);
      } catch (err) {
        if (err.name === "AbortError") return; // silently ignore cancelled requests
        console.error("Face detection failed:", err);
        if (!stopped) {
          setHasFace(false);
          setDetectedEmotion(null);
          onPreviewEmotion?.(null);
        }
      }
    };

    detectFace();
    const intervalId = setInterval(detectFace, 600);

    return () => {
      stopped = true;
      clearInterval(intervalId);
      abortRef.current?.abort();
    };
  }, [ready, cameraError, onPreviewEmotion]);

  const handleCapture = () => {
    if (!videoRef.current || capturing || !ready) return;
    setCapturing(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
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
              <video
                ref={videoRef}
                className="camera-feed"
                autoPlay
                playsInline
                muted
              />

              <div className="camera-overlay">
                <div className="face-frame">
                  <span className="frame-corner top-left" />
                  <span className="frame-corner top-right" />
                  <span className="frame-corner bottom-left" />
                  <span className="frame-corner bottom-right" />

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
