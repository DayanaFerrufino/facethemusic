import { useState } from "react";
import Home from "./pages/Home";
import Camera from "./pages/Camera";
import Loader from "./pages/Loader";
import Playlist from "./pages/Playlist";

const API_URL = "http://localhost:8000";

function App() {
  const [page, setPage] = useState("home");
  const [emotion, setEmotion] = useState(null);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [previewEmotion, setPreviewEmotion] = useState(null);
  const [pendingPlaylist, setPendingPlaylist] = useState(null);

  const handleGeneratePlaylist = async (imageBlob) => {
    setPage("loader");
    setError(null);
    setPendingPlaylist(null);

    const formData = new FormData();
    formData.append("file", imageBlob, "capture.jpg");

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (!data.emotion) {
        setError("No face detected. Please try again.");
        setPage("camera");
        return;
      }

      setPendingPlaylist({
        emotion: data.emotion,
        songs: data.songs,
      });
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the API running?");
      setPage("camera");
    }
  };

  const handleLoaderDone = () => {
    if (!pendingPlaylist) return;

    setEmotion(pendingPlaylist.emotion);
    setSongs(pendingPlaylist.songs);
    setPendingPlaylist(null);
    setPage("playlist");
  };

  if (page === "camera") {
    return(
      <Camera 
        onGeneratePlaylist={handleGeneratePlaylist} 
        error={error}
        onPreviewEmotion={setPreviewEmotion}
      />
    );
  }

  if (page === "loader") {
    return (
      <Loader
        emotion={pendingPlaylist?.emotion || previewEmotion}
        isComplete={Boolean(pendingPlaylist)}
        onDone={handleLoaderDone}
      />
    );
  }

  if (page === "playlist") {
    return (
      <Playlist
        emotion={emotion}
        songs={songs}
        onScanAgain={() => setPage("camera")}
      />
    );
  }

  return <Home onStart={() => setPage("camera")} />;
}

export default App;
