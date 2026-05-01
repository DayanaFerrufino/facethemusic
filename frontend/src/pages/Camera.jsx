function Camera({ onGeneratePlaylist }) {
  return (
    <main>
      <h1>This is the camera page.</h1>

      <button onClick={onGeneratePlaylist}>
        Generate playlist
      </button>
    </main>
  )
}

export default Camera
