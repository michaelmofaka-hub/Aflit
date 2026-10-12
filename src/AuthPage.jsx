import { useState } from 'react'
import { apiRequest } from './api'
import Popup from './Popup.jsx'
import './App.css'

function AuthPage({
  mode,
  onSwitchMode,
  onBack,
  onLoginSuccess,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [isLoading, setIsLoading] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const endpoint = isRegister
        ? '/users/register'
        : '/users/login'

      const body = isRegister
        ? { username, email, password }
        : { email, password }

      const data = await apiRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (isRegister) {
        setPopupType('success')
        setMessage('Account created! Redirecting to login...')
        setPassword('')

        setTimeout(() => {
          setMessage('')
          onSwitchMode()
        }, 1500)

        return
      }

      if (!data.access_token) {
        throw new Error(
          'Login succeeded, but no access token was returned.'
        )
      }

      localStorage.setItem('access_token', data.access_token)

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

  return (
    <div className="auth-page">
      <button
        className="auth-back-button"
        onClick={onBack}
        type="button"
      >
        ← Back to Aflit
      </button>

      <div className="auth-card">
        <a
          className="brand auth-brand"
          href="#"
          onClick={(event) => event.preventDefault()}
        >
          Aflit<span>.</span>
        </a>

        <h1>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>

        <p className="auth-description">
          {isRegister
            ? 'Start understanding your creator growth.'
            : 'Log in to continue growing your audience.'}
        </p>

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

          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete={
                isRegister ? 'new-password' : 'current-password'
              }
              required
              minLength={8}
            />
          </label>

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

        <p className="auth-switch">
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}

          <button
            type="button"
            onClick={onSwitchMode}
            disabled={isLoading}
          >
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>

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