import { useEffect, useRef, useState } from "react";
import logo from "../assets/brand/logo.svg";
import "../styles/pages/loader.css";
import angryIcon from "../assets/emotions/angry.png";
import disgustIcon from "../assets/emotions/disgust.png";
import fearIcon from "../assets/emotions/fear.png";
import happyIcon from "../assets/emotions/happy.png";
import neutralIcon from "../assets/emotions/neutral.png";
import sadIcon from "../assets/emotions/sad.png";
import surpriseIcon from "../assets/emotions/surprise.png";

// Maps the detected emotion to the image shown inside the loader circle.
const EMOTION_ICONS = {
  angry: angryIcon,
  disgust: disgustIcon,
  fear: fearIcon,
  happy: happyIcon,
  neutral: neutralIcon,
  sad: sadIcon,
  surprise: surpriseIcon,
};

// Keeps the loader visible long enough for the progress animation to feel smooth.
const MIN_LOADER_TIME = 5000;

function Loader({ emotion, isComplete, onDone }) {
  
  const emotionIcon = EMOTION_ICONS[emotion] || neutralIcon;    // Shows the detected emotion image, or neutral if no emotion is available yet.
  const startedAtRef = useRef(null);                            // Stores when the loader started without causing a re-render.
  const [progress, setProgress] = useState(8);                  // Controls the percentage text and progress bar width.

  useEffect(() => {
    // Set the loader start time the first time this component runs.
    if (!startedAtRef.current) {
      startedAtRef.current = Date.now();
    }

    // Update the fake progress bar while the backend is generating the playlist.
    const intervalId = setInterval(() => {
      setProgress((currentProgress) => {
        // Stop updating once the loader is complete.
        if (currentProgress >= 100) return currentProgress;

        // Track how long the loader has been visible.
        const elapsedTime = Date.now() - startedAtRef.current;
        const minimumTimePassed =
          elapsedTime >= MIN_LOADER_TIME;

        // Only finish when the backend is done and the minimum time has passed.
        if (isComplete && minimumTimePassed) {
          return 100;
        }

        // Move progress toward 95% based on time, then wait for real completion.
        const timedProgress = Math.round(
          8 + (elapsedTime / MIN_LOADER_TIME) * 87,
        );

        return Math.min(95, Math.max(currentProgress, timedProgress));
      });
    }, 100);

    // Clear the timer when the loader closes or re-renders.
    return () => clearInterval(intervalId);
  }, [isComplete]);

  useEffect(() => {
    // Once progress reaches 100%, wait briefly so the user can see completion.
    if (progress === 100) {
      const timeoutId = setTimeout(onDone, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [progress, onDone]);

  return (
    <main className="loader-page">
      <div className="topbar">
        <img className="topbar-logo" src={logo} alt="Face the Music logo" />
        <h1 className="topbar-title">Face The Music</h1>
      </div>

      <div className="content">
        <div className="description">
          {/* Text tells the user the app is analyzing and generating songs. */}
          <p>Analysing your expression and generating your playlist…</p>
          <h1>One moment</h1>
        </div>

        {/* Animated spinner circles surround the detected emotion image. */}
        <div className="spinner">
          <svg className="spinner-svg spinner-outer" viewBox="0 0 360 360">
            <circle
              className="spinner-circle spinner-circle-outer"
              cx="180"
              cy="180"
              r="170"
            />
          </svg>

          <svg className="spinner-svg spinner-middle" viewBox="0 0 360 360">
            <circle
              className="spinner-circle spinner-circle-middle"
              cx="180"
              cy="180"
              r="150"
            />
          </svg>

          <svg className="spinner-svg spinner-inner" viewBox="0 0 360 360">
            <circle
              className="spinner-circle spinner-circle-inner"
              cx="180"
              cy="180"
              r="130"
            />
          </svg>

          <div className="emotion-image">
            {/* Emotion icon gives visual feedback while the playlist loads. */}
            {emotionIcon && <img src={emotionIcon} alt="" />}
          </div>
        </div>

        {/* Accessible progress bar showing how close the loader is to finishing. */}
        <div
          className="progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <span className="percentage">{progress}% complete</span>
          <div
            className="progress-bar"
            style={{ "--progress": `${progress}%` }}
          />
        </div>
      </div>
    </main>
  );
}

export default Loader;
