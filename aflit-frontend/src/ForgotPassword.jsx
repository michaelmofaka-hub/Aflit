
import { useState } from 'react'
import './App.css'
import './style.css'

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')

    if (!email.trim()) {
      setMessage('Please enter your email address.')
      return
    }

    setIsLoading(true)

    try {
      // Backend password recovery endpoint
      // will be connected here.

      setMessage(
        'Password recovery is not connected yet.'
      )

    } catch (error) {
      setMessage(
        error.message || 'Something went wrong.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card auth-recovery-card">

        <div className="card-layout-right auth-recovery-content">

          <a className="brand auth-brand" href="/">
            Aflit<span>.</span>
          </a>

          <div className="auth-recovery-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7.5 12 13l8-5.5M5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11A1.5 1.5 0 0 1 5.5 5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="auth-recovery-eyebrow">ACCOUNT RECOVERY</p>
          <h1>Forgot your password?</h1>
          <p className="auth-description">
            Enter the email address linked to your account and
            we’ll help you get back in.
          </p>

          <form onSubmit={handleSubmit} className="auth-recovery-form">

            <label className="auth-field">
              Email

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <button
              className="get-started-button auth-submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Please wait...'
                : 'Send reset link'}
            </button>

          </form>

          {message && (
            <p className="auth-recovery-message" role="status">
              {message}
            </p>
          )}

          <button
            type="button"
            className="auth-recovery-back"
            onClick={onBack}
          >
            <span aria-hidden="true">←</span>
            Back to login
          </button>

        </div>

      </div>

    </div>
  )
}

export default ForgotPassword
