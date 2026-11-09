
import './App.css'

function Welcome() {
  return (
    <section className="welcome-section">
      <div className="welcome-content">
        <div className="welcome-eyebrow">
          <span className="welcome-indicator"></span>
          CREATOR INTELLIGENCE & BUSINESS OS
        </div>

        <h1>
          Welcome to <span>Aflit.</span>
        </h1>

        <p className="welcome-description">
          Your creator journey, all in one place.
          Understand your performance, discover opportunities,
          and turn your audience into a business.
        </p>

        <div className="welcome-highlights">
          <span>
            <span className="highlight-dot amber-dot"></span>
            Analytics
          </span>

          <span>
            <span className="highlight-dot teal-dot"></span>
            AI Insights
          </span>

          <span>
            <span className="highlight-dot purple-dot"></span>
            Monetization
          </span>
        </div>
      </div>

      <div className="welcome-visual" aria-hidden="true">
        <div className="welcome-orbit orbit-one"></div>
        <div className="welcome-orbit orbit-two"></div>

        <div className="welcome-glow"></div>

        <div className="welcome-center">
          <span>A</span>
        </div>

        <div className="welcome-floating-card floating-card-one">
          <div>
            <strong>Grow</strong>
            <small>Understand your reach</small>
          </div>
        </div>

        <div className="welcome-floating-card floating-card-two">
          <div>
            <strong>Discover</strong>
            <small>Find new opportunities</small>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Welcome
