import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { CAR_COLORS, FIXES } from '../constants'
import { updateAccount, getCurrentUsername } from '../storage'

interface Props {
  onBack: () => void
}

export default function GaragePage({ onBack }: Props) {
  const { account, refreshAccount } = useAuth()
  const [msg, setMsg] = useState('')

  function changeColor(hex: string) {
    if (!account) return
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.car.color = hex
      return a
    })
    refreshAccount()
    setMsg('Color changed!')
    setTimeout(() => setMsg(''), 2000)
  }

  function useFix(tier: 'light' | 'mid' | 'extreme') {
    if (!account) return
    const fix = FIXES.find(f => f.tier === tier)
    if (!fix) return
    const key = `fix${tier.charAt(0).toUpperCase() + tier.slice(1)}` as keyof typeof account.inventory
    if (account.inventory[key] <= 0) {
      setMsg(`No ${fix.name} available!`)
      setTimeout(() => setMsg(''), 2000)
      return
    }
    if (account.car.damage <= 0) {
      setMsg('Car already has no damage!')
      setTimeout(() => setMsg(''), 2000)
      return
    }
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.inventory[key] -= 1
      a.car.damage = Math.max(0, a.car.damage - fix.repairAmount)
      return a
    })
    refreshAccount()
    setMsg(`Used ${fix.name}! Repaired ${fix.repairAmount} damage.`)
    setTimeout(() => setMsg(''), 2000)
  }

  if (!account) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #30363d' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f6fc' }}>Garage</h2>
        <button onClick={onBack} style={{ padding: '8px 20px', borderRadius: 6, background: '#21262d', color: '#e6edf3', fontSize: 14, border: '1px solid #30363d' }}>
          Back
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20, maxWidth: 600, margin: '0 auto', width: '100%' }}>
        {msg && <p style={{ color: '#39d152', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{msg}</p>}

        {/* Car preview */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 24, border: '1px solid #30363d', marginBottom: 20, textAlign: 'center' }}>
          <div style={{
            width: 120, height: 60, background: account.car.color, borderRadius: 10, margin: '0 auto 16px',
            border: '2px solid #30363d', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 16, height: 8, background: '#f1c40f', borderRadius: '2px 2px 0 0' }} />
          </div>
          <p style={{ color: '#8b949e', fontSize: 13 }}>
            Damage: {Math.round(account.car.damage)}%
          </p>
          <div style={{ height: 6, background: '#21262d', borderRadius: 3, marginTop: 6 }}>
            <div style={{ width: `${account.car.damage}%`, height: '100%', background: account.car.damage > 50 ? '#f85149' : account.car.damage > 20 ? '#f1c40f' : '#39d152', borderRadius: 3 }} />
          </div>
        </div>

        {/* Repairs */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', marginBottom: 12 }}>Repairs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FIXES.map(fix => {
              const key = `fix${fix.tier.charAt(0).toUpperCase() + fix.tier.slice(1)}` as keyof typeof account.inventory
              const count = account.inventory[key]
              return (
                <div key={fix.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0d1117', borderRadius: 8, border: '1px solid #30363d' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{fix.name}</p>
                    <p style={{ fontSize: 12, color: '#8b949e' }}>{fix.desc} (owned: {count})</p>
                  </div>
                  <button
                    onClick={() => useFix(fix.tier)}
                    disabled={count <= 0 || account.car.damage <= 0}
                    style={{
                      padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                      background: count > 0 && account.car.damage > 0 ? '#238636' : '#21262d',
                      color: count > 0 && account.car.damage > 0 ? '#fff' : '#484f58',
                      border: '1px solid #30363d',
                    }}
                  >
                    Use
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Colors */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', marginBottom: 12 }}>Colors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {CAR_COLORS.map(c => {
              const unlocked = account.unlockedColors.includes(c.hex)
              const isCurrent = account.car.color === c.hex
              return (
                <button
                  key={c.hex}
                  onClick={() => unlocked && changeColor(c.hex)}
                  disabled={!unlocked || isCurrent}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, background: isCurrent ? 'rgba(35,134,54,0.2)' : '#0d1117',
                    border: isCurrent ? '1px solid #238636' : '1px solid #30363d',
                    cursor: unlocked && !isCurrent ? 'pointer' : 'default',
                    opacity: unlocked ? 1 : 0.5,
                  }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex, border: '2px solid #30363d' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: isCurrent ? '#39d152' : '#e6edf3' }}>
                    {c.name}
                    {!unlocked && ` (${c.cost}c)`}
                    {isCurrent && ' (current)'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
