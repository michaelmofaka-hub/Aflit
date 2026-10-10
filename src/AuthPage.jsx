import { useState } from 'react'
import './App.css'

function AuthPage({ mode, onSwitchMode, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const isRegister = mode === 'register'

  function handleSubmit(event) {
    event.preventDefault()

    // We'll connect this form to FastAPI next.
    console.log({
      mode,
      email,
      password,
      username
    })
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
        <a className="brand auth-brand" href="#">
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
          >
            {isRegister ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}

          <button
            type="button"
            onClick={onSwitchMode}
          >
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
