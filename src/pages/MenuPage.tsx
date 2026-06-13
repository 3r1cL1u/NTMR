import { useAuth } from '../context/AuthContext'
import type { Screen } from '../App'

interface Props {
  onNavigate: (s: Screen) => void
}

export default function MenuPage({ onNavigate }: Props) {
  const { account, logout } = useAuth()

  const navItems: { label: string; target: Screen; desc: string }[] = [
    { label: 'Race', target: 'lobby', desc: 'Compete in a race' },
    { label: 'Garage', target: 'garage', desc: 'Fix and customize your car' },
    { label: 'Shop', target: 'shop', desc: 'Buy boosts, repairs, and colors' },
    { label: 'Achievements', target: 'achievements', desc: 'View your progress' },
  ]

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '16px 24px', borderRadius: 10, background: '#21262d',
    color: '#e6edf3', fontSize: 16, fontWeight: 700, textAlign: 'left',
    border: '1px solid #30363d', transition: 'background 0.15s',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)' }}>
      <div style={{ width: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f0f6fc' }}>Nitro Math & Racing</h1>
          <p style={{ color: '#8b949e', marginTop: 4, fontSize: 14 }}>Welcome, {account?.username}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
            <span style={{ color: '#f1c40f', fontWeight: 700 }}>{account?.coins ?? 0} coins</span>
            <span style={{ color: '#58a6ff', fontWeight: 700 }}>{account?.xp ?? 0} XP</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {navItems.map(item => (
            <button key={item.target} style={btnStyle} onClick={() => onNavigate(item.target)}
              onMouseEnter={e => (e.currentTarget.style.background = '#30363d')}
              onMouseLeave={e => (e.currentTarget.style.background = '#21262d')}
            >
              <span>{item.label}</span>
              <span style={{ color: '#8b949e', fontSize: 13, fontWeight: 400 }}>{item.desc}</span>
            </button>
          ))}
        </div>
        <button onClick={logout} style={{ width: '100%', padding: '12px', borderRadius: 8, background: 'transparent', color: '#f85149', fontSize: 14, border: '1px solid #30363d', marginTop: 20 }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
