<<<<<<< Updated upstream
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
=======
import { useEffect, useRef, useState } from 'react'
import heart from '../assets/heart.svg'
import logo from '../assets/logo.svg'
import smiley from '../assets/smiley.svg'
import '../styles/pages/camera.css'

function Camera({ onGeneratePlaylist }) {

    const videoRef = useRef(null)
    const [cameraError, setCameraError] = useState('')

    useEffect(() => {
        let stream

        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                }
            } catch (error) {
                console.error('Camera access failed:', error)
                setCameraError('Camera access was blocked or is unavailable.')
            }
        }

        startCamera()

        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [])


    return (
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
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
=======
            <div className="content">
                
                <div className="camera">
                    {cameraError ? (
                        <p>{cameraError}</p>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                className="camera-video"
                                autoPlay
                                playsInline
                                muted
                            />

                            <div className="camera-overlay">

                                <div className="face-frame">
                                    <span className="frame-corner top-left"></span>
                                    <span className="frame-corner top-right"></span>
                                    <span className="frame-corner bottom-left"></span>
                                    <span className="frame-corner bottom-right"></span>


                                    <img
                                        className="camera-instruction-icon"
                                        src={smiley}
                                        alt=""
                                    />
                                    <p>Center your face<br />in the frame</p>
                                </div>

                            </div>
                        </>
                    )}
                </div>


                <div className="emotion-image">
                    <img
                        className="emotion-placeholder-icon"
                        src={heart}
                        alt=""
                    />
                    <p>Your emotion will<br />appear here after scan</p>
                </div>
>>>>>>> Stashed changes

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
