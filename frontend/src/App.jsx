import { useState } from 'react'
import Home from './pages/Home'
import Camera from './pages/Camera'
import Loader from './pages/Loader'
import Playlist from './pages/Playlist'
import './App.css'

function App() {
  
  const [page, setPage] = useState('home')

  if (page === 'camera') {
    return (
      <Camera
        onGeneratePlaylist={() => setPage('loader')}
      />
    )
  }

  if (page === 'loader') {
    return (
      <Loader
        onNext={() => setPage('playlist')}
      />
    )
  }

  if (page === 'playlist') {
    return (
      <Playlist
        onScanAgain={() => setPage('camera')}
      />
    )
  }

  return (
    <Home
      onStart={() => setPage('camera')}
    />
  )

}

export default App
