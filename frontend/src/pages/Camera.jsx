import logo from '../assets/logo.svg'
import '../styles/pages/camera.css'


function Camera({ onGeneratePlaylist }) {
    return (
        <main className="camera-page">

            <div className="topbar">
                <img className="topbar-logo" src={logo} alt="Face the Music logo" />

                <h1 className="topbar-title">Face The Music</h1>
            </div>

            <div className="camera-content">
                
                <div className="camera">
                    <p>Camera</p>
                </div>

                <div className="emotion-detected">
                    <p>Detected emotion</p>
                </div>

            </div>

            <button className="button" onClick={onGeneratePlaylist}>
                Generate playlist
            </button>

        </main>
    )
}

export default Camera
