import { useEffect, useRef, useState } from "react";
import logo from "../assets/brand/logo.svg";
import back from "../assets/icons/back.svg";
import next from "../assets/icons/next.svg";
import pause from "../assets/icons/pause.svg";
import play from "../assets/icons/play.svg";
import angryIcon from "../assets/emotions/angry.png";
import disgustIcon from "../assets/emotions/disgust.png";
import fearIcon from "../assets/emotions/fear.png";
import happyIcon from "../assets/emotions/happy.png";
import neutralIcon from "../assets/emotions/neutral.png";
import sadIcon from "../assets/emotions/sad.png";
import surpriseIcon from "../assets/emotions/surprise.png";
import "../styles/pages/playlist.css";

// Maps the detected emotion to the image shown in the emotion card.
const EMOTION_ICONS = {
  angry: angryIcon,
  disgust: disgustIcon,
  fear: fearIcon,
  happy: happyIcon,
  neutral: neutralIcon,
  sad: sadIcon,
  surprise: surpriseIcon,
};

// Converts seconds into a readable time format like 1:05.
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Converts song duration from milliseconds into readable time.
const formatDurationMs = (ms) => {
  const totalSecs = Math.floor((ms || 0) / 1000);
  return formatTime(totalSecs);
};

// Solid colors used when a song does not have album artwork.
const PLACEHOLDER_COLORS = [
  "#ff6b6b",
  "#4dabf7",
  "#51cf66",
  "#ffd43b",
  "#9775fa",
  "#ff922b",
  "#20c997",
];

// Picks a placeholder color based on the song position.
const getPlaceholderColor = (index) =>
  PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];

// Shortens long titles inside missing-artwork boxes.
const getPlaceholderTitle = (title) =>
  title && title.length > 28 ? `${title.slice(0, 28)}...` : title || "Song";

function Playlist({ emotion, songs, onScanAgain }) {
  
  const audioRef = useRef(new Audio());                   // Stores the browser audio player without rendering an audio element.
  const [currentIndex, setCurrentIndex] = useState(0);    // Tracks which song in the playlist is currently selected.
  const [isPlaying, setIsPlaying] = useState(true);       // Controls the play/pause button and soundwave animation.
  const [currentTime, setCurrentTime] = useState(0);      // Tracks playback time for the scrubber and current time label.
  const [duration, setDuration] = useState(0);            // Stores the current song duration for the scrubber and end time label.  

  // Gets the selected song and emotion image for the page.
  const currentSong = songs[currentIndex];
  const emotionImage = EMOTION_ICONS[emotion];

  useEffect(() => {
    // Load a new audio preview whenever the selected song changes.
    const audio = audioRef.current;
    if (!currentSong) return;

    // If the song has no preview URL, stop playback safely.
    if (!currentSong.preview_url) {
      Promise.resolve().then(() => setIsPlaying(false));
      return;
    }

    // Set the audio source and reset the playback timer for the new song.
    audio.src = currentSong.preview_url;
    audio.load();
    Promise.resolve().then(() => {
      setCurrentTime(0);
      setDuration(0);
    });

    // If the player was already playing, start the new song automatically.
    if (isPlaying) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);   // Keep React state synced with the browser audio player's current time.
    const onDurationChange = () => setDuration(audio.duration);     // Store the audio duration when the browser loads it.

    // Move to the next song automatically when the current preview ends.
    const onEnded = () => {
      if (songs.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % songs.length);
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      // Clean up audio listeners and stop playback when leaving the page.
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    // Ignore play/pause clicks if the current song has no preview.
    if (!currentSong?.preview_url) return;

    // Pause if playing, otherwise try to start playback.
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleNext = () => {
    // Move forward and wrap to the first song after the last song.
    if (songs.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    }
  };
  const handlePrev = () => {
    // Move backward and wrap to the last song before the first song.
    if (songs.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
    }
  };

  const handleSelectSong = (index) => {
    // Select a song from the playlist and try to play it right away.
    setCurrentIndex(index);
    const audio = audioRef.current;
    audio.src = songs[index].preview_url;
    audio.load();

    if (!songs[index].preview_url) {
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleScrub = (e) => {
    // Convert the click position on the scrubber into a new audio time.
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Percent used by CSS to fill the scrubber bar.
  const scrubPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Capitalizes the detected emotion for display.
  const capitalise = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <main className="playlist-page">
      <div className="topbar">
        <img className="topbar-logo" src={logo} alt="Face the Music logo" />
        <h1 className="topbar-title">Face The Music</h1>
      </div>

      <div className="content">
        <div className="player-panel">
          {/* Current song player with album art, scrubber, and controls. */}
          <div className="current-song">
            {currentSong?.artwork ? (
              <img
                className="current-song-image"
                src={currentSong.artwork}
                alt={currentSong.name}
              />
            ) : (
              <div
                className="current-song-image song-image-placeholder"
                style={{
                  "--placeholder-color": getPlaceholderColor(currentIndex),
                }}
              >
                <span>{getPlaceholderTitle(currentSong?.name)}</span>
              </div>
            )}

            <div className="current-song-info">
              <span className="current-song-name">
                {currentSong?.name || "—"}
              </span>
              <span className="current-song-artist">
                {currentSong?.artist || "—"}
              </span>
            </div>

            <div className="scrubber" onClick={handleScrub}>
              {/* CSS variable controls the scrubber fill and handle position. */}
              <div
                className="scrubber-bar"
                style={{ "--scrub": `${scrubPercent}%` }}
              />
              <div className="time">
                <span className="current-time">{formatTime(currentTime)}</span>
                <span className="end-time">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="controller">
              <button
                className="control-button back"
                aria-label="Previous song"
                onClick={handlePrev}
              >
                <img src={back} alt="" />
              </button>
              <button
                className={`control-button ${isPlaying ? "pause" : "play"}`}
                aria-label={isPlaying ? "Pause" : "Play"}
                onClick={togglePlay}
              >
                <img src={isPlaying ? pause : play} alt="" />
              </button>
              <button
                className="control-button next"
                aria-label="Next song"
                onClick={handleNext}
              >
                <img src={next} alt="" />
              </button>
            </div>
          </div>

          <div className="emotion-card">

            <div className="emotion-detected">

              {/* Shows the emotion image that matches the detected emotion. */}
              <div className="emotion-image">
                {emotionImage && (
                  <img src={emotionImage} alt="" className="emotion-image-icon" />
                )}
              </div>

              {/* Shows the detected emotion name and playlist size. */}
              <div className="emotion-text">
                <span className="emotion-label">{capitalise(emotion)}</span>
                <span className="emotion-song-count">{songs.length} songs</span>
              </div>

            </div>

            {/* Returns to the camera page for a new scan. */}
            <button className="button" onClick={onScanAgain}>
              Scan again
            </button>

          </div>
          
        </div>

        <div className="playlist">
          <div className="playlist-header">
            <h1>Your Playlist</h1>
            {/* Soundwave animates while playing and pauses when music is paused. */}
            <svg
              className={`soundwave${isPlaying ? "" : " paused"}`}
              viewBox="0 0 72 32"
              aria-hidden="true"
            >
              <rect
                className="wave-bar wave-bar-1"
                x="4"
                y="12"
                width="4"
                height="8"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-2"
                x="12"
                y="8"
                width="4"
                height="16"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-3"
                x="20"
                y="4"
                width="4"
                height="24"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-4"
                x="28"
                y="10"
                width="4"
                height="12"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-5"
                x="36"
                y="6"
                width="4"
                height="20"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-6"
                x="44"
                y="12"
                width="4"
                height="8"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-7"
                x="52"
                y="7"
                width="4"
                height="18"
                rx="2"
              />
              <rect
                className="wave-bar wave-bar-8"
                x="60"
                y="11"
                width="4"
                height="10"
                rx="2"
              />
            </svg>
          </div>

          <div className="playlist-content">
            {/* Render every recommended song as a clickable playlist row. */}
            {songs.map((song, index) => (
              <div
                key={song.id}
                className={`song${index === currentIndex ? " active" : ""}`}
                onClick={() => handleSelectSong(index)}
              >
                {song.artwork ? (
                  <img
                    className="song-image"
                    src={song.artwork}
                    alt={song.name}
                  />
                ) : (
                  <div
                    className="song-image song-image-placeholder"
                    style={{
                      "--placeholder-color": getPlaceholderColor(index),
                    }}
                  >
                    <span>{getPlaceholderTitle(song.name)}</span>
                  </div>
                )}
                <div className="song-info">
                  {/* Song title and artist from the recommendation response. */}
                  <span className="song-name">{song.name}</span>
                  <span className="song-artist">{song.artist}</span>
                </div>
                <span className="song-time">
                  {formatDurationMs(song.duration_ms)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Playlist;
