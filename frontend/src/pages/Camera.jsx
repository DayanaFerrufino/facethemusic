import { useEffect, useRef, useState } from "react";
import catEmotion from "../assets/cat_emotion.svg";
import catCamera from "../assets/cat_camera.svg";
import catWait from "../assets/cat_wait.svg";
import catError from "../assets/cat_error.svg";
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
        console.error("Camera access failed:", err);
        setCameraError("Camera access was blocked or is unavailable");
      });

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

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

      <div className={`content${ready ? " content--ready" : " content--waiting"}`}>
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

                  <img className="camera-instruction-icon" src={catCamera} alt="" />
                  <p>
                    Center your face in the frame
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {ready && (
          <div className="camera-hint">
            <img src={catEmotion} alt="" className="camera-emotion-icon" />
            <p>
              Your emotion will appear here after scan
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
