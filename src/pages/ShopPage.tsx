import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BOOSTS, FIXES, CAR_COLORS } from '../constants'
import { updateAccount, getCurrentUsername } from '../storage'

interface Props {
  onBack: () => void
}

export default function ShopPage({ onBack }: Props) {
  const { account, refreshAccount } = useAuth()
  const [msg, setMsg] = useState('')

  function buyBoost(tier: 'light' | 'mid' | 'extreme') {
    if (!account) return
    const boost = BOOSTS.find(b => b.tier === tier)
    if (!boost) return
    if (account.coins < boost.cost) {
      setMsg('Not enough coins!')
      setTimeout(() => setMsg(''), 2000)
      return
    }
    const key = `boost${tier.charAt(0).toUpperCase() + tier.slice(1)}` as 'boostLight' | 'boostMid' | 'boostExtreme'
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.coins -= boost.cost
      a.inventory[key] += 1
      return a
    })
    refreshAccount()
    setMsg(`Bought ${boost.name}!`)
    setTimeout(() => setMsg(''), 2000)
  }

  function buyFix(tier: 'light' | 'mid' | 'extreme') {
    if (!account) return
    const fix = FIXES.find(f => f.tier === tier)
    if (!fix) return
    if (account.coins < fix.cost) {
      setMsg('Not enough coins!')
      setTimeout(() => setMsg(''), 2000)
      return
    }
    const key = `fix${tier.charAt(0).toUpperCase() + tier.slice(1)}` as 'fixLight' | 'fixMid' | 'fixExtreme'
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.coins -= fix.cost
      a.inventory[key] += 1
      return a
    })
    refreshAccount()
    setMsg(`Bought ${fix.name}!`)
    setTimeout(() => setMsg(''), 2000)
  }

  function buyColor(hex: string, cost: number) {
    if (!account) return
    if (account.unlockedColors.includes(hex)) {
      setMsg('Already owned!')
      setTimeout(() => setMsg(''), 2000)
      return
    }
    if (account.coins < cost) {
      setMsg('Not enough coins!')
      setTimeout(() => setMsg(''), 2000)
      return
    }
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.coins -= cost
      a.unlockedColors.push(hex)
      return a
    })
    refreshAccount()
    setMsg('Color unlocked!')
    setTimeout(() => setMsg(''), 2000)
  }

  if (!account) return null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2333 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #30363d' }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f6fc' }}>Shop</h2>
        <span style={{ color: '#f1c40f', fontWeight: 700, fontSize: 15 }}>{account.coins} coins</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20, maxWidth: 600, margin: '0 auto', width: '100%' }}>
        <button onClick={onBack} style={{ padding: '8px 20px', borderRadius: 6, background: '#21262d', color: '#e6edf3', fontSize: 14, border: '1px solid #30363d', marginBottom: 16 }}>
          Back
        </button>

        {msg && <p style={{ color: '#39d152', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{msg}</p>}

        {/* Boosts */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>Boosts</h3>
          <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 12 }}>More fuel in math mode, skip words in typing mode.</p>
          {BOOSTS.map(boost => (
            <div key={boost.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{boost.name}</p>
                <p style={{ fontSize: 12, color: '#8b949e' }}>{boost.desc}</p>
              </div>
              <button
                onClick={() => buyBoost(boost.tier)}
                disabled={account.coins < boost.cost}
                style={{
                  padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: account.coins >= boost.cost ? '#238636' : '#21262d',
                  color: account.coins >= boost.cost ? '#fff' : '#484f58',
                  border: '1px solid #30363d',
                }}
              >
                {boost.cost}c
              </button>
            </div>
          ))}
        </div>

        {/* Fixes */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>Repair Kits</h3>
          <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 12 }}>Fix car damage from wrong answers.</p>
          {FIXES.map(fix => (
            <div key={fix.tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0d1117', borderRadius: 8, border: '1px solid #30363d', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{fix.name}</p>
                <p style={{ fontSize: 12, color: '#8b949e' }}>{fix.desc}</p>
              </div>
              <button
                onClick={() => buyFix(fix.tier)}
                disabled={account.coins < fix.cost}
                style={{
                  padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  background: account.coins >= fix.cost ? '#238636' : '#21262d',
                  color: account.coins >= fix.cost ? '#fff' : '#484f58',
                  border: '1px solid #30363d',
                }}
              >
                {fix.cost}c
              </button>
            </div>
          ))}
        </div>

        {/* Colors */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 16, border: '1px solid #30363d' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>Car Colors</h3>
          <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 12 }}>Customize your Indy 500 racer.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {CAR_COLORS.filter(c => c.cost > 0).map(c => {
              const owned = account.unlockedColors.includes(c.hex)
              return (
                <button
                  key={c.hex}
                  onClick={() => buyColor(c.hex, c.cost)}
                  disabled={owned || account.coins < c.cost}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, background: '#0d1117',
                    border: owned ? '1px solid #238636' : '1px solid #30363d',
                    opacity: owned ? 0.6 : account.coins >= c.cost ? 1 : 0.4,
                  }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.hex, border: '2px solid #30363d' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: owned ? '#39d152' : '#e6edf3' }}>
                    {owned ? 'Owned' : `${c.name} (${c.cost}c)`}
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
