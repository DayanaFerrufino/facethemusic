import { useState } from "react";
import Home from "./pages/Home";
import Camera from "./pages/Camera";
import Loader from "./pages/Loader";
import Playlist from "./pages/Playlist";

// Backend API address used by the frontend requests.
const API_URL = "http://localhost:8000";

// Decorative music notes shown behind every page.
function MusicNotesBackground() {
  return (
    <div className="notes-bg">
      <span>𝄞</span>
      <span>♫</span>
      <span>♬</span>
      <span>♪</span>
      <span>♫</span>
      <span>♪</span>
      <span>♬</span>
      <span>𝄞</span>
    </div>
  );
}

function App() {
  
  const [page, setPage] = useState("home");                         // Tracks which page component should be shown: "home", "camera", "loader", or "playlist".
  const [emotion, setEmotion] = useState(null);                     // Stores the final detected emotion for the playlist page.
  const [songs, setSongs] = useState([]);                           // Stores the final recommended songs for the playlist page.
  const [error, setError] = useState(null);                         // Stores any error message to show on the camera page, such as camera access or backend errors.
  const [previewEmotion, setPreviewEmotion] = useState(null);       // Stores the live emotion preview while the user is on the camera page.
  const [pendingPlaylist, setPendingPlaylist] = useState(null);     // Temporarily stores the playlist while the loader finishes its progress bar.

  const handleGeneratePlaylist = async (imageBlob) => {
    // Show the loader while the backend analyzes the image and creates songs.
    setPage("loader");
    setError(null);
    setPendingPlaylist(null);

    // FormData is used because the backend expects an uploaded image file.
    const formData = new FormData();
    formData.append("file", imageBlob, "capture.jpg");

    try {
      // Send the captured camera image to the backend analyze endpoint.
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      // Read the detected emotion and playlist from the backend response.
      const data = await res.json();

      // If no face was detected, go back to the camera page and show an error.
      if (!data.emotion) {
        setError("No face detected. Please try again.");
        setPage("camera");
        return;
      }

      // Save the result, but let the loader finish before showing the playlist.
      setPendingPlaylist({
        emotion: data.emotion,
        songs: data.songs,
      });
    } catch (err) {
      // If the backend is not reachable, return to the camera page with an error.
      console.error(err);
      setError("Could not reach the server. Is the API running?");
      setPage("camera");
    }
  };

  const handleLoaderDone = () => {
    // Do nothing until the backend response has arrived.
    if (!pendingPlaylist) return;

    // Move the completed loader result into the real playlist state.
    setEmotion(pendingPlaylist.emotion);
    setSongs(pendingPlaylist.songs);
    setPendingPlaylist(null);
    setPage("playlist");
  };

  // Choose which page component to render based on the current page state.
  let currentPage;

  if (page === "camera") {
    // Camera captures the user's face and sends the final image for analysis.
    currentPage = (
      <Camera
        onGeneratePlaylist={handleGeneratePlaylist}
        error={error}
        onPreviewEmotion={setPreviewEmotion}
      />
    );
  } else if (page === "loader") {
    // Loader waits for both the backend result and the progress animation.
    currentPage = (
      <Loader
        emotion={pendingPlaylist?.emotion || previewEmotion}
        isComplete={Boolean(pendingPlaylist)}
        onDone={handleLoaderDone}
      />
    );
  } else if (page === "playlist") {
    // Playlist displays the detected emotion and recommended songs.
    currentPage = (
      <Playlist
        emotion={emotion}
        songs={songs}
        onScanAgain={() => setPage("camera")}
      />
    );
  } else {
    // Home is the starting screen before camera access begins.
    currentPage = <Home onStart={() => setPage("camera")} />;
  }

  return (
    <>
      <MusicNotesBackground />

      {/* Wraps the active page so all pages share the same background layer. */}
      <main className="page-content">
        {currentPage}
      </main>
    </>
  );
}

export default App;
