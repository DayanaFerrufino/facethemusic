import '../styles/pages/playlist.css'

function Playlist({ onScanAgain }) {
  return (
    <main>
      <h1>This is the playlist page.</h1>

      <button onClick={onScanAgain}>
        Scan again
      </button>
    </main>
  )
}

export default Playlist
