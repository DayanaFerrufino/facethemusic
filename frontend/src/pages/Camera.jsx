import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.svg";
import "../styles/pages/camera.css";

function Camera({ onGeneratePlaylist, error }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

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
        console.error("Webcam error:", err);
      });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || capturing) return;
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

      <div className="content">
        <div className="camera">
          <video
            ref={videoRef}
            className="camera-feed"
            autoPlay
            playsInline
            muted
          />
        </div>

        <div className="camera-hint">
          <p>
            {ready
              ? "Position your face in frame, then hit Generate"
              : "Waiting for camera access…"}
          </p>
        </div>
      </div>

      {error && <p className="camera-error">{error}</p>}

      <button
        className={`button${!ready || capturing ? " button--disabled" : ""}`}
        onClick={handleCapture}
        disabled={!ready || capturing}
      >
        {capturing ? "Analysing…" : "Generate playlist"}
      </button>
    </main>
  );
}

export default Camera;
