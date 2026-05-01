import '../styles/pages/home.css'

function Home({ onStart }) {
  return (
    <main>

      <h1>Face the Music</h1>

      <p>
        Discover music recommendations based on your facial expression.
      </p>

      <button onClick={onStart}>
        Let&apos;s get started
      </button>

    </main>
  )
}

export default Home
