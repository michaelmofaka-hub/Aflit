
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GoogleLogin } from '@react-oauth/google'
import {
  faEye,
  faEyeSlash,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons'

import { apiRequest } from './api'
import Popup from './Popup.jsx'

import './App.css'
import './style.css'

function AuthPage({
  mode,
  onSwitchMode,
  onBack,
  onLoginSuccess,
  onForgotPassword,
  onGoogleLogin
}) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const [message, setMessage] = useState('')
  const [popupType, setPopupType] = useState('success')

  const isRegister = mode === 'register'

  function showMessage(type, text) {
    setPopupType(type)
    setMessage(text)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading || isGoogleLoading) return

    setMessage('')

    const cleanEmail = email.trim()
    const cleanUsername = username.trim()

    if (isRegister && !cleanUsername) {
      showMessage('error', 'Please enter your username.')
      return
    }

    if (!cleanEmail) {
      showMessage('error', 'Please enter your email address.')
      return
    }

    if (password.length < 8) {
      showMessage(
        'error',
        'Your password must contain at least 8 characters.'
      )
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isRegister
        ? '/users/register'
        : '/users/login'

      const body = isRegister
        ? {
            username: cleanUsername,
            email: cleanEmail,
            password
          }
        : {
            email: cleanEmail,
            password
          }

      const data = await apiRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (isRegister) {
        setPassword('')
        setUsername('')

        showMessage(
          'success',
          'Your account has been created. You can now log in.'
        )

        onSwitchMode()
        return
      }

      if (!data?.access_token) {
        throw new Error(
          'Authentication succeeded, but no access token was returned.'
        )
      }

      localStorage.setItem('token', data.access_token)

      showMessage(
        'success',
        'Login successful. Welcome back to Aflit!'
      )

      setTimeout(() => {
        onLoginSuccess?.()
      }, 700)

    } catch (error) {
      console.error('Authentication failed:', error)

      showMessage(
        'error',
        error.message || 'Unable to authenticate. Please try again.'
      )

    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    if (isLoading || isGoogleLoading) return

    setMessage('')

    const idToken = credentialResponse?.credential

    if (!idToken) {
      showMessage(
        'error',
        'Google did not return an ID token. Please try again.'
      )
      return
    }

    if (!onGoogleLogin) {
      showMessage(
        'error',
        'Google sign-in is not connected yet.'
      )
      return
    }

    setIsGoogleLoading(true)

    try {
      await onGoogleLogin(idToken)

    } catch (error) {
      console.error('Google authentication failed:', error)

      showMessage(
        'error',
        error.message || 'Google sign-in failed.'
      )

    } finally {
      setIsGoogleLoading(false)
    }
  }

  function handleGoogleError() {
    showMessage(
      'error',
      'Google sign-in failed. Please try again.'
    )
  }

  function handleForgotPassword() {
    if (onForgotPassword) {
      onForgotPassword()
      return
    }

    showMessage(
      'error',
      'Password recovery is not connected yet.'
    )
  }

  return (
    <div className="auth-page">

      <button
        className="auth-back-button"
        type="button"
        onClick={onBack}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Aflit</span>
      </button>

      <div className="auth-card">

        {/* LEFT BRAND PANEL */}

        <section className="card-layout-left">

          <a
            href="/"
            className="brand auth-brand"
            onClick={(event) => {
              event.preventDefault()
              onBack?.()
            }}
          >
            Aflit<span>.</span>
          </a>

          <div className="auth-panel-copy">

            <p className="auth-eyebrow">
              CREATOR INTELLIGENCE & BUSINESS OS
            </p>

            <h2>
              {isRegister
                ? 'Turn your audience into opportunity.'
                : 'Your creator journey, in focus.'}
            </h2>

            <p className="auth-panel-description">
              Understand your audience, discover growth
              opportunities and build a stronger creator
              business with Aflit.
            </p>

          </div>

          <div className="auth-visual" aria-hidden="true">

            <div className="auth-visual-ring auth-visual-ring-one" />

            <div className="auth-visual-ring auth-visual-ring-two" />

            <div className="auth-visual-core">
              A<span>.</span>
            </div>

            <div className="auth-visual-caption">
              <span className="auth-status-dot" />
              Growth, with clarity
            </div>

          </div>

        </section>


        {/* RIGHT AUTHENTICATION PANEL */}

        <section className="card-layout-right">

          <div className="auth-heading">

            <p className="auth-eyebrow">
              {isRegister ? 'GET STARTED' : 'WELCOME BACK'}
            </p>

            <h1>
              {isRegister
                ? 'Create your account'
                : 'Welcome back'}
            </h1>

            <p className="auth-description">
              {isRegister
                ? 'Create your Aflit account and start building.'
                : 'Sign in to continue building your creator business.'}
            </p>

          </div>


          {/* EMAIL AND PASSWORD FORM */}

          <form className="auth-form" onSubmit={handleSubmit}>

            {isRegister && (
              <label className="auth-field">

                <span>Username</span>

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Your creator name"
                  autoComplete="username"
                  required
                  disabled={isLoading || isGoogleLoading}
                />

              </label>
            )}


            <label className="auth-field">

              <span>Email address</span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isLoading || isGoogleLoading}
              />

            </label>


            <label className="auth-field">

              <span>Password</span>

              <div className="password-input-container">

                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete={
                    isRegister
                      ? 'new-password'
                      : 'current-password'
                  }
                  minLength={8}
                  required
                  disabled={isLoading || isGoogleLoading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setIsPasswordVisible(current => !current)
                  }
                  aria-label={
                    isPasswordVisible
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  <FontAwesomeIcon
                    icon={
                      isPasswordVisible
                        ? faEyeSlash
                        : faEye
                    }
                  />
                </button>

              </div>

            </label>


            {!isRegister && (
              <button
                id="forgot_password"
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading || isGoogleLoading}
              >
                Forgot password?
              </button>
            )}


            <button
              type="submit"
              className="get-started-button auth-submit"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading
                ? 'Please wait...'
                : isRegister
                  ? 'Create account'
                  : 'Log in'}
            </button>

          </form>


          {/* ACCOUNT SWITCH */}

          <p className="auth-switch">

            {isRegister
              ? 'Already have an account?'
              : "Don't have an account?"}

            {' '}

            <button
              type="button"
              onClick={() => {
                setMessage('')
                setPassword('')
                onSwitchMode?.()
              }}
              disabled={isLoading || isGoogleLoading}
            >
              {isRegister ? 'Log in' : 'Create account'}
            </button>

          </p>


          {/* DIVIDER */}

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>


          {/* GOOGLE SIGN-IN */}

          <div className="google-auth-button">

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleError}
              text="continue_with"
              theme="outline"
              size="large"
              shape="rectangular"
              width="320"
            />

          </div>


          <p className="auth-legal">
            By continuing, you agree to use Aflit responsibly.
            <input type="checkbox" required />
          </p>

        </section>

      </div>


      {/* FEEDBACK POPUP */}

      {message && (
        <Popup
          message={message}
          type={popupType}
        />
      )}

    </div>
  )
}

export default AuthPage
