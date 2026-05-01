function Home({ onStart }) {
  return (
    <main>
      <p>This is the home page.</p>

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
