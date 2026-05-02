import logo from '../assets/logo.svg'
import back from '../assets/back.svg'
import next from '../assets/next.svg'
import pause from '../assets/pause.svg'
import play from '../assets/play.svg'
import '../styles/pages/playlist.css'

function Playlist({ onScanAgain }) {

    return (

        <main className="playlist-page">
        
            <div className="topbar">
                <img className="topbar-logo" src={logo} alt="Face the Music logo" />

                <h1 className="topbar-title">Face The Music</h1>
            </div>

            <div className="content">

                <div className="player-panel">

                    <div className="current-song">

                        <div className="current-song-image"></div>

                        <div className="current-song-info">

                            <span className="current-song-name">Song Name</span>
                            <span className="current-song-artist">Artist</span>

                        </div>

                        <div className="scrubber">
                            <div className="scrubber-bar"></div>
                            <div className="time">
                                <div className="current-time">0:00</div>
                                <div className="end-time">4:00</div>
                            </div>
                        </div>

                        <div className="controller">

                            <button className="control-button back" aria-label="Previous song">
                                <img src={back} alt="" />
                            </button>

                            <button className="control-button pause" aria-label="Pause song">
                                <img src={pause} alt="" />
                            </button>

                            {/* <button className="control-button play" aria-label="Play song">
                                <img src={play} alt="" />
                            </button> */}

                            <button className="control-button next" aria-label="Next song">
                                <img src={next} alt="" />
                            </button>

                        </div>


                    </div>

                    <div className="emotion-card">

                        <div className="emotion-detected">

                            <div className="emotion-image"></div>

                            <div className="emotion-text">
                                <span className="emotion-label">Emotion</span>
                                <span className="emotion-song-count">20 songs</span>
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
                            <rect className="wave-bar wave-bar-1" x="4" y="12" width="4" height="8" rx="2" />
                            <rect className="wave-bar wave-bar-2" x="12" y="8" width="4" height="16" rx="2" />
                            <rect className="wave-bar wave-bar-3" x="20" y="4" width="4" height="24" rx="2" />
                            <rect className="wave-bar wave-bar-4" x="28" y="10" width="4" height="12" rx="2" />
                            <rect className="wave-bar wave-bar-5" x="36" y="6" width="4" height="20" rx="2" />
                            <rect className="wave-bar wave-bar-6" x="44" y="12" width="4" height="8" rx="2" />
                            <rect className="wave-bar wave-bar-7" x="52" y="7" width="4" height="18" rx="2" />
                            <rect className="wave-bar wave-bar-8" x="60" y="11" width="4" height="10" rx="2" />
                        </svg>


                    </div>

                    <div className="playlist-content">

                        <div className="song active">

                            <div className="song-image"></div>

                            <div className="song-info">
                                <span className="song-name">Song Name</span>
                                <span className="song-artist">Artist</span>
                            </div>

                            <span className="song-time">4:00</span>

                        </div>

                        <div className="song">

                            <div className="song-image"></div>

                            <div className="song-info">
                                <span className="song-name">Song Name</span>
                                <span className="song-artist">Artist</span>
                            </div>

                            <span className="song-time">4:00</span>

                        </div>

                    </div>

                </div>

            </div>
            

        </main>

    )

}

export default Playlist
