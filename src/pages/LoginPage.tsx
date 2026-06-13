import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (isRegister) {
      const err = register(username, password)
      if (err) setError(err)
    } else {
      const err = login(username, password)
      if (err) setError(err)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)' }}>
      <div style={{ background: '#161b22', borderRadius: 12, padding: 40, width: 380, border: '1px solid #30363d' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 4, color: '#f0f6fc' }}>Nitro Math & Racing</h1>
        <p style={{ textAlign: 'center', color: '#8b949e', marginBottom: 30, fontSize: 14 }}>Race. Answer. Win.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#c9d1d9', fontSize: 14, fontWeight: 600 }}>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3', fontSize: 15 }}
              placeholder="Enter username"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#c9d1d9', fontSize: 14, fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3', fontSize: 15 }}
              placeholder="Enter password"
            />
          </div>
          {error && <p style={{ color: '#f85149', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#238636', color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button onClick={() => { setIsRegister(!isRegister); setError('') }} style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'transparent', color: '#58a6ff', fontSize: 14, border: '1px solid #30363d' }}>
          {isRegister ? 'Already have an account? Sign in' : 'New here? Create account'}
        </button>
      </div>
    </div>
  )
}
