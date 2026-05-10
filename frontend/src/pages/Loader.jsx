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

const EMOTION_ICONS = {
  angry: angryIcon,
  disgust: disgustIcon,
  fear: fearIcon,
  happy: happyIcon,
  neutral: neutralIcon,
  sad: sadIcon,
  surprise: surpriseIcon,
};

const MIN_LOADER_TIME = 5000;

function Loader({ emotion, isComplete, onDone }) {
  const emotionIcon = EMOTION_ICONS[emotion] || neutralIcon;
  const startedAtRef = useRef(null);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!startedAtRef.current) {
      startedAtRef.current = Date.now();
    }

    const intervalId = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 100) return currentProgress;

        const elapsedTime = Date.now() - startedAtRef.current;
        const minimumTimePassed =
          elapsedTime >= MIN_LOADER_TIME;

        if (isComplete && minimumTimePassed) {
          return 100;
        }

        const timedProgress = Math.round(
          8 + (elapsedTime / MIN_LOADER_TIME) * 87,
        );

        return Math.min(95, Math.max(currentProgress, timedProgress));
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [isComplete]);

  useEffect(() => {
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
          <p>Analysing your expression and generating your playlist…</p>
          <h1>One moment</h1>
        </div>

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
            {emotionIcon && <img src={emotionIcon} alt="" />}
          </div>
        </div>

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
