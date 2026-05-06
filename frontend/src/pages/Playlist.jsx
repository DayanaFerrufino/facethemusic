import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.svg";
import back from "../assets/back.svg";
import next from "../assets/next.svg";
import pause from "../assets/pause.svg";
import play from "../assets/play.svg";
import "../styles/pages/playlist.css";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatDurationMs = (ms) => {
  const totalSecs = Math.floor((ms || 0) / 1000);
  return formatTime(totalSecs);
};

function Playlist({ emotion, songs, onScanAgain }) {
  const audioRef = useRef(new Audio());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!currentSong) return;
    audio.src = currentSong.preview_url;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => handleNext();
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % songs.length);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);

  const handleSelectSong = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
    const audio = audioRef.current;
    audio.src = songs[index].preview_url;
    audio.load();
    audio.play().catch(() => {});
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const scrubPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
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
          <div className="current-song">
            {currentSong?.artwork ? (
              <img
                className="current-song-image"
                src={currentSong.artwork}
                alt={currentSong.name}
              />
            ) : (
              <div className="current-song-image" />
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
              <div className="emotion-image" />
              <div className="emotion-text">
                <span className="emotion-label">{capitalise(emotion)}</span>
                <span className="emotion-song-count">{songs.length} songs</span>
              </div>
            </div>
            <button className="button" onClick={onScanAgain}>
              Scan again
            </button>
          </div>
        </div>

        <div className="playlist">
          <div className="playlist-header">
            <h1>Your Playlist</h1>
            <svg className="soundwave" viewBox="0 0 72 32" aria-hidden="true">
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
                  <div className="song-image" />
                )}
                <div className="song-info">
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
