import { useAuth } from '../context/AuthContext'
import { BOT_CONFIGS, PLAYER_NAME } from '../constants'
import type { RaceMode } from '../types'

interface Props {
  mode: RaceMode
  setMode: (m: RaceMode) => void
  onStart: () => void
  onBack: () => void
}

export default function LobbyPage({ mode, setMode, onStart, onBack }: Props) {
  const { account } = useAuth()

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)' }}>
      <div style={{ width: 480 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 24, color: '#f0f6fc' }}>Race Lobby</h2>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
          <button onClick={() => setMode('math')} style={{
            padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: 15,
            background: mode === 'math' ? '#238636' : '#21262d',
            color: '#e6edf3', border: '1px solid #30363d',
          }}>Math Mode</button>
          <button onClick={() => setMode('typing')} style={{
            padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: 15,
            background: mode === 'typing' ? '#238636' : '#21262d',
            color: '#e6edf3', border: '1px solid #30363d',
          }}>Typing Mode</button>
        </div>

        <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d', marginBottom: 24 }}>
          <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Grid (5 spots)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#0d1117', borderRadius: 6, border: '1px solid #238636' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: account?.car.color ?? '#e23636', border: '2px solid #fff' }} />
              <span style={{ fontWeight: 700, color: '#f0f6fc' }}>{PLAYER_NAME}</span>
              <span style={{ marginLeft: 'auto', color: '#8b949e', fontSize: 13 }}>You</span>
            </div>
            {BOT_CONFIGS.map((bot, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#0d1117', borderRadius: 6 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: bot.color, border: '2px solid #30363d' }} />
                <span style={{ color: '#e6edf3' }}>{bot.name}</span>
                <span style={{ marginLeft: 'auto', color: '#8b949e', fontSize: 13 }}>{Math.round(bot.skill * 100)}% skill</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBack} style={{ flex: 1, padding: '14px', borderRadius: 8, background: '#21262d', color: '#e6edf3', fontSize: 15, fontWeight: 600, border: '1px solid #30363d' }}>
            Back
          </button>
          <button onClick={onStart} style={{ flex: 2, padding: '14px', borderRadius: 8, background: '#238636', color: '#fff', fontSize: 16, fontWeight: 800 }}>
            Start Race
          </button>
        </div>
      </div>
    </div>
  )
}
