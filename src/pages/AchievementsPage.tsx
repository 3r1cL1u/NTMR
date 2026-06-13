import { useAuth } from '../context/AuthContext'
import { ACHIEVEMENTS } from '../constants'

interface Props {
  onBack: () => void
}

export default function AchievementsPage({ onBack }: Props) {
  const { account } = useAuth()

  if (!account) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #30363d' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f6fc' }}>Achievements</h2>
        <span style={{ color: '#58a6ff', fontWeight: 700, fontSize: 15 }}>{account.xp} XP</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20, maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <button onClick={onBack} style={{ padding: '8px 20px', borderRadius: 6, background: '#21262d', color: '#e6edf3', fontSize: 14, border: '1px solid #30363d', marginBottom: 16 }}>
          Back
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ACHIEVEMENTS.map(ach => {
            const unlocked = account.achievements.includes(ach.id)
            return (
              <div key={ach.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 10,
                background: unlocked ? 'rgba(35,134,54,0.1)' : '#161b22',
                border: unlocked ? '1px solid #238636' : '1px solid #30363d',
                opacity: unlocked ? 1 : 0.6,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: unlocked ? '#238636' : '#21262d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 900, color: unlocked ? '#fff' : '#484f58',
                  flexShrink: 0,
                }}>
                  {unlocked ? ach.reward : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: unlocked ? '#39d152' : '#e6edf3' }}>{ach.name}</p>
                  <p style={{ fontSize: 13, color: '#8b949e' }}>{ach.desc}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: unlocked ? '#f1c40f' : '#484f58' }}>
                  {unlocked ? `+${ach.reward}c` : `${ach.reward}c`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
