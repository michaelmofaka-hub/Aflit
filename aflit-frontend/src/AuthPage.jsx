
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const [message, setMessage] = useState('')
  const [popupType, setPopupType] = useState('success')

  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()

    if (isLoading) return

    setMessage('')

    if (isRegister && !username.trim()) {
      setPopupType('error')
      setMessage('Please enter your username.')
      return
    }

    if (!password.trim() || password.length < 8) {
      setPopupType('error')
      setMessage('Password must contain at least 8 characters.')
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isRegister
        ? '/users/register'
        : '/users/login'

      const body = isRegister
        ? {
            username: username.trim(),
            email: email.trim(),
            password
          }
        : {
            email: email.trim(),
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
        setPopupType('success')
        setMessage('Account created successfully. You can now log in.')

        setPassword('')
        setUsername('')

        onSwitchMode()
        return
      }

      if (!data.access_token) {
        throw new Error(
          'Login succeeded, but no access token was returned.'
        )
      }

      localStorage.setItem('token', data.access_token)

      setPopupType('success')
      setMessage('Login successful! Redirecting to dashboard...')

      setTimeout(() => {
        onLoginSuccess()
      }, 1000)

    } catch (error) {
      setPopupType('error')
      setMessage(error.message || 'Something went wrong.')

      console.error('Authentication failed:', error)

    } finally {
      setIsLoading(false)
    }
  }

  function handleForgotPassword() {
    if (onForgotPassword) {
      onForgotPassword()
    } else {
      setPopupType('error')
      setMessage('Password recovery is not connected yet.')
    }
  }

  async function handleGoogleLogin() {
    if (!onGoogleLogin) {
      setPopupType('error')
      setMessage('Google sign-in is not connected yet.')
      return
    }

    try {
      await onGoogleLogin()
    } catch (error) {
      setPopupType('error')
      setMessage(error.message || 'Google sign-in failed.')
    }
  }

  return (
    <div className="auth-page">

      {/* BACK BUTTON */}

      <button
        className="auth-back-button"
        onClick={onBack}
        type="button"
      >
        Back to Aflit
      </button>


      {/* AUTHENTICATION CARD */}

      <div className="auth-card">

        {/* LEFT PANEL */}

        <div className="card-layout-left">
          <a
            className="brand auth-brand"
            href="/"
            onClick={(event) => {
              event.preventDefault()
              onBack()
            }}
          >
            Aflit<span>.</span>
          </a>

          <div className="auth-panel-copy">
            <p className="auth-eyebrow">CREATOR INTELLIGENCE</p>
            <h2>
              {isRegister
                ? 'Make every move a growth move.'
                : 'Your creator journey, in focus.'}
            </h2>
            <p className="auth-panel-description">
              Understand your audience, find new opportunities,
              and build your creator business with confidence.
            </p>
          </div>

          <div className="auth-visual" aria-hidden="true">
            <div className="auth-visual-ring auth-visual-ring-one" />
            <div className="auth-visual-ring auth-visual-ring-two" />
            <div className="auth-visual-core">A<span>.</span></div>
            <div className="auth-visual-caption">
              <span className="auth-status-dot" />
              Growth, with clarity
            </div>
          </div>
        </div>


        {/* RIGHT PANEL */}

        <div className="card-layout-right">

          <h1>
            {isRegister
              ? 'Create your account'
              : 'Welcome back'}
          </h1>


          <p className="auth-description">
            {isRegister
              ? 'Start understanding your creator growth.'
              : 'Log in to continue growing your audience.'}
          </p>


          {/* AUTH FORM */}

          <form onSubmit={handleSubmit}>

            {isRegister && (
              <label className="auth-field">
                Username

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Your creator name"
                  autoComplete="username"
                  required
                />
              </label>
            )}


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


            {/* PASSWORD */}

            <label className="auth-field">
              Password

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
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setIsPasswordVisible(!isPasswordVisible)
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


            {/* FORGOT PASSWORD */}

            {!isRegister && (
              <button
                id="forgot_password"
                type="button"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            )}


            {/* SUBMIT */}

            <button
              className="get-started-button auth-submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Please wait...'
                : isRegister
                  ? 'Create account'
                  : 'Log in'}
            </button>

          </form>


          {/* SWITCH AUTH MODE */}

          <p className="auth-switch">

            {isRegister
              ? 'Already have an account?'
              : "Don't have an account?"}

            {' '}

            <button
              type="button"
              onClick={onSwitchMode}
              disabled={isLoading}
            >
              {isRegister ? 'Log in' : 'Register'}
            </button>

          </p>


          {/* DIVIDER */}

          <div className="auth-divider">
            <span>OR</span>
          </div>


          {/* GOOGLE SIGN IN */}

          <button
            type="button"
            className="google-auth-button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faGoogle} />

            Continue with Google
          </button>

        </div>

      </div>


      {/* POPUP */}

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
