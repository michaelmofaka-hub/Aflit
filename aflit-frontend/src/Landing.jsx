import './App.css'

function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <a className="brand" href="#">
          Aflit<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>

          <button
            className="login-button"
            onClick={onLogin}
          >
            Log in
          </button>
        </div>
      </nav>

      <section className="landing-hero" id="about">
        <p className="eyebrow">
          YOUR CREATOR JOURNEY, ALL IN ONE PLACE
        </p>

        <h1>
          Turn your content
          <br />
          into <span>real growth.</span>
        </h1>

        <p className="hero-description">
          Understand your audience, track your performance,
          and discover smarter ways to grow across platforms.
        </p>

        <button
          className="get-started-button"
          onClick={onGetStarted}
        >
          Get started
        </button>
      </section>

      <section className="landing-features" id="features">
        <div className="features-heading">
          <p className="eyebrow">BUILT FOR CREATORS</p>

          <h2>Everything you need to grow.</h2>

          <p>
            Understand your performance, find opportunities,
            and make smarter decisions with your data.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">↗</div>

            <h3>Creator Analytics</h3>

            <p>
              Track views, subscribers, audience activity,
              and content performance in one place.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">◆</div>

            <h3>Monetization</h3>

            <p>
              Understand your revenue and explore ways
              to build sustainable creator income.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">✦</div>

            <h3>AI Insights</h3>

            <p>
              Turn your analytics into practical ideas
              for improving your content strategy.
            </p>
          </article>
        </div>
      </section>
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#">
              Aflit<span>.</span>
            </a>
            <p>
              Helping creators understand their data,
              grow their audience, and build their future.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <h4>Explore</h4>
              <a href="#features">Features</a>
              <a href="#about">About Aflit</a>
            </div>

            <div>
              <h4>Account</h4>
              <button onClick={onLogin}>Log in</button>
              <button onClick={onGetStarted}>Get started</button>
            </div>

            <div>
              <h4>Company</h4>
              <span>Mofo Agencies/Company</span>
              <a href="mailto:info@mofoagencies.com">
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Mofo Agencies/Company.
            All rights reserved.
          </p>
          <span>Built for creators. Designed for growth.</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage