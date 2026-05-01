import logo from '../assets/logo.svg'
import '../styles/pages/home.css'

function Home({ onStart }) {
    return (
        <main className="home-page">

            <img src={logo} alt="Face the Music logo" />


            <h1>Face the Music</h1>

            <p>
                Discover music recommendations based on your facial expression.
            </p>

            <button className="button" onClick={onStart}>
                Let&apos;s get started
            </button>

        </main>
    )
}

export default Home
