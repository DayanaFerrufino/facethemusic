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

  // Once on loader page, fire the API call
  const handleGeneratePlaylist = async (imageBlob) => {
    setPage("loader");
    setError(null);

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

      setEmotion(data.emotion);
      setSongs(data.songs);
      setPage("playlist");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the API running?");
      setPage("camera");
    }
  };

  if (page === "camera") {
    return <Camera onGeneratePlaylist={handleGeneratePlaylist} error={error} />;
  }

  if (page === "loader") {
    return <Loader />;
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
