import logo from '../assets/logo.svg'
import '../styles/pages/loader.css'

function Loader({ onNext }) {
    return (
        <main className="loader-page">

            <div className="topbar">
                <img className="topbar-logo" src={logo} alt="Face the Music logo" />

                <h1 className="topbar-title">Face The Music</h1>
            </div>

            <div className="content">

                <div className="description">
                    <p>Generating your playlist for...</p> 
                    <h1>Emotion</h1>
                </div>

                <div className="spinner">

                    <svg className="spinner-svg spinner-outer" viewBox="0 0 360 360">
                        <circle className="spinner-circle spinner-circle-outer" cx="180" cy="180" r="170" />
                    </svg>

                    <svg className="spinner-svg spinner-middle" viewBox="0 0 360 360">
                        <circle className="spinner-circle spinner-circle-middle" cx="180" cy="180" r="150" />
                    </svg>

                    <svg className="spinner-svg spinner-inner" viewBox="0 0 360 360">
                        <circle className="spinner-circle spinner-circle-inner" cx="180" cy="180" r="130" />
                    </svg>

                    <div className="emotion-detected">
                        <p>Detected emotion</p>
                    </div>

                </div>


                <div className="progress">

                    <span className='percentage'>
                        100% complete
                    </span>

                    <div className="progress-bar">

                    </div>

                </div>

            </div>
            
        </main>
    )
}

export default Loader
