
import { useState } from 'react'
import './App.css'
import './style.css'
import './PagePolish.css'

function LandingPage({
  onGetStarted,
  onLogin,
  onPrivacy,
  onSubmitFeedback
}) {
  const [feedback, setFeedback] = useState({
    username: '',
    email: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  async function handleFeedback(event) {
    event.preventDefault()

    setFeedbackError('')
    setIsSubmitted(false)

    if (!feedback.username.trim() ||
        !feedback.email.trim() ||
        !feedback.message.trim()) {
      setFeedbackError('Please complete all fields.')
      return
    }

    if (!onSubmitFeedback) {
      setFeedbackError(
        'Feedback submission is not connected yet.'
      )
      return
    }

    try {
      setIsSubmitting(true)

      await onSubmitFeedback({
        username: feedback.username.trim(),
        email: feedback.email.trim(),
        feedback: feedback.message.trim()
      })

      setIsSubmitted(true)

      setFeedback({
        username: '',
        email: '',
        message: ''
      })

    } catch (error) {
      setFeedbackError(
        error.message || 'Unable to submit feedback. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="landing-page">

      {/* NAVIGATION */}

      <nav className="landing-nav">
        <a className="brand" href="/">
          Aflit<span>.</span>
        </a>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>

          <button
            className="login-button"
            onClick={onLogin}
          >
            Log in
          </button>
        </div>
      </nav>


      {/* HERO SECTION */}

      <section className="landing-hero" id="about">

        <div className="left">

          <h1>
            Turn your content
            <br />
            into <span>real growth.</span>
          </h1>

          <p className="hero-description">
            Understand your audience, track your performance,
            discover opportunities and find smarter ways
            to turn your content into a business.
          </p>

          <button
            className="get-started-button"
            onClick={onGetStarted}
          >
            Get started
          </button>

        </div>

        <div className="landing-hero-visual">

          <img
            src="/dashboard.png"
            alt="Aflit creator analytics dashboard"
          />

        </div>

      </section>


      {/* HOW AFLIT WORKS */}

      <section
        className="how-it-works"
        id="how-it-works"
      >

        <div className="right">

          <h1 className="right-heading">
            How <span>Aflit</span> works.
          </h1>

          <p>
            Your journey from understanding your audience
            to building a creator business.
          </p>

        </div>

        <div className="left">

          <ul>
            <li>
              <strong>01. Create your account</strong>
              <p>
                Register and establish your personal
                creator workspace.
              </p>
            </li>

            <li>
              <strong>02. Connect your platforms</strong>
              <p>
                Connect supported social media accounts
                and bring your creator data together.
              </p>
            </li>

            <li>
              <strong>03. Understand your performance</strong>
              <p>
                Explore analytics, audience activity
                and content performance.
              </p>
            </li>

            <li>
              <strong>04. Get AI-powered insights</strong>
              <p>
                Discover opportunities and actionable
                recommendations to improve your strategy.
              </p>
            </li>

            <li>
              <strong>05. Explore monetization</strong>
              <p>
                Discover ways to turn your audience,
                content and business opportunities into revenue.
              </p>
            </li>

            <li>
              <strong>06. Measure your growth</strong>
              <p>
                Track your progress, evaluate your decisions
                and improve your results.
              </p>
            </li>
          </ul>

        </div>

      </section>


      {/* FEATURES */}

      <section
        className="landing-features"
        id="features"
      >

        <div className="features-heading">

          <h2>
            Everything you need to grow.
          </h2>

          <p>
            Understand your performance, find opportunities,
            and make smarter decisions with your data.
          </p>

        </div>

        <div className="feature-grid">

          <article className="feature-card">

            <img
              src="/analytics.png"
              className="image-first"
              alt="Creator analytics"
            />

            <h3>Creator Analytics</h3>

            <p>
              Track views, subscribers, audience activity,
              and content performance in one place.
            </p>

          </article>


          <article className="feature-card">

            <img
              src="/monetization.png"
              alt="Creator monetization"
            />

            <h3>Monetization</h3>

            <p>
              Understand your revenue and explore
              opportunities to build sustainable creator income.
            </p>

          </article>


          <article className="feature-card">

            <img
              src="/botagent.png"
              alt="AI-powered creator insights"
            />

            <h3>AI Insights</h3>

            <p>
              Turn your analytics into practical ideas
              and recommendations for improving your
              content strategy.
            </p>

          </article>

        </div>

      </section>


      {/* FEEDBACK SECTION */}

      <section className="feedback-container">

        <h2>Send us feedback</h2>

        <p>
          Have a suggestion, encountered an issue,
          or want to help us improve Aflit?
          We'd love to hear from you.
        </p>

        <form
          onSubmit={handleFeedback}
          className="feedback-page"
        >

          <label htmlFor="username" className="usernamelabel">
            Username
          </label>

          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={feedback.username}
            onChange={(e) =>
              setFeedback({
                ...feedback,
                username: e.target.value
              })
            }
            required
          />


          <label htmlFor="email" className="email">
            Email
          </label>

          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={feedback.email}
            onChange={(e) =>
              setFeedback({
                ...feedback,
                email: e.target.value
              })
            }
            required
          />


          <label htmlFor="feedback" className="feedbackLabel">
            Feedback
          </label>

          <textarea
            id="feedback"
            placeholder="Share your feedback, suggestions or issues..."
            value={feedback.message}
            onChange={(e) =>
              setFeedback({
                ...feedback,
                message: e.target.value
              })
            }
            rows={5}
            required
          />


          {feedbackError && (
            <p className="feedback-error" role="alert">
              {feedbackError}
            </p>
          )}

          {isSubmitted && (
            <p className="feedback-success" role="status">
              Thank you! Your feedback was submitted successfully.
            </p>
          )}


          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : 'Submit feedback'}
          </button>

        </form>

      </section>


      {/* FOOTER */}

      <footer className="landing-footer">

        <div className="footer-top">

          <div className="footer-brand">

            <a className="brand" href="/">
              Aflit<span>.</span>
            </a>

            <p>
              Helping creators understand their data,
              grow their audience, discover opportunities
              and build their future.
            </p>

          </div>


          <div className="footer-links">

            <div>

              <h4>Explore</h4>

              <a href="#features">Features</a>

              <a href="#how-it-works">
                How Aflit works
              </a>

              <a href="#about">About Aflit</a>

            </div>


            <div>

              <h4>Account</h4>

              <button onClick={onLogin}>
                Log in
              </button>

              <button onClick={onGetStarted}>
                Get started
              </button>

            </div>


            <div>

              <h4>Legal & Support</h4>

              <button onClick={onPrivacy}>
                Privacy Policy
              </button>

              <a href="mailto:michaelmofaka@gmail.com">
                Contact Support
              </a>

              <a href="mailto:michaelmofaka@gmail.com">
                Privacy Enquiries
              </a>

            </div>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} Aflit.
            All rights reserved.
          </p>

          <span>
            Built for creators. Designed for growth.
          </span>

        </div>

      </footer>

    </div>
  )
}

export default LandingPage