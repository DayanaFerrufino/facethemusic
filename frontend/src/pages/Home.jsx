import "../styles/pages/home.css";

function Home({ onStart }) {
  return (
    <main className="home-page">
      <div className="home-logo" aria-label="Face the Music logo">
        <svg className="home-logo-svg" viewBox="0 0 140 140" role="img" aria-hidden="true">
            <defs>
                <linearGradient id="homeLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffb4a2" />
                    <stop offset="55%" stopColor="#ee979b" />
                </linearGradient>
            </defs>

            <circle className="home-logo-circle" cx="70" cy="70" r="60" />

            <g className="home-soundwave">
                <rect className="home-wave-bar home-wave-bar-1" x="38" y="66" width="10" height="30" rx="6" />
                <rect className="home-wave-bar home-wave-bar-2" x="52" y="56" width="10" height="40" rx="6" />
                <rect className="home-wave-bar home-wave-bar-3" x="66" y="48" width="10" height="48" rx="6" />
                <rect className="home-wave-bar home-wave-bar-4" x="80" y="60" width="10" height="36" rx="6" />
                <rect className="home-wave-bar home-wave-bar-5" x="94" y="54" width="10" height="42" rx="6" />
            </g>
        </svg>
      </div>

      <h1>Face the Music</h1>

      <p>
        Discover music recommendations based on your facial expression.
      </p>

      <button className="button" onClick={onStart}>
        Let&apos;s get started
      </button>
    </main>
  );
}

export default Home;