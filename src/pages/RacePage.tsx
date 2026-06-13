import { useRef, useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { BOT_CONFIGS, LAPS_TO_WIN, RACE_REWARD_COINS, RACE_REWARD_XP, WIN_REWARD_COINS, WIN_REWARD_XP, MAX_DAMAGE, BOOSTS, PLAYER_NAME } from '../constants'
import { updateAccount, getCurrentUsername } from '../storage'
import type { RaceMode, BotConfig, GamePhase } from '../types'

interface Props {
  mode: RaceMode
  onFinish: () => void
}

interface CarState {
  name: string
  progress: number
  speed: number
  fuel: number
  damage: number
  laps: number
  color: string
  isPlayer: boolean
  active: boolean
  finishTime: number | null
}

const TOTAL_LAPS = LAPS_TO_WIN
const BASE_SPEED = 0.15
const FUEL_SPEED_BONUS = 0.35
const FUEL_DRAIN = 0.3
const FUEL_PER_CORRECT = 25
const DAMAGE_PER_WRONG = 15
const DAMAGE_PER_TYPING_MISTAKE = 5

function generateMathQuestion() {
  const ops = ['+', '-', '*'] as const
  const op = ops[Math.floor(Math.random() * ops.length)]!
  let a = 0, b = 0, answer = 0
  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 50) + 1
      b = Math.floor(Math.random() * 50) + 1
      answer = a + b
      break
    case '-':
      a = Math.floor(Math.random() * 50) + 10
      b = Math.floor(Math.random() * a) + 1
      answer = a - b
      break
    case '*':
      a = Math.floor(Math.random() * 12) + 2
      b = Math.floor(Math.random() * 12) + 2
      answer = a * b
      break
  }
  return { text: `${a} ${op} ${b} = ?`, answer }
}

const TYPING_PASSAGES = [
  'The car raced around the track at incredible speed.',
  'Nitro fuel gives the engine a powerful boost.',
  'Every racer wants to cross the finish line first.',
  'The crowd cheered as the cars approached the final lap.',
  'A perfect start is crucial for a good race position.',
  'The tires gripped the track through the sharp turn.',
  'Victory belongs to the most persistent racer.',
  'Speed alone is not enough without good control.',
  'The checkered flag signaled the end of the race.',
  'Each lap brings the drivers closer to the finish.',
  'The engine roared as the green flag dropped.',
  'Precision and timing make a champion racer.',
  'The racetrack gleamed under the bright lights.',
  'A pit stop can change the outcome of the entire race.',
  'The final straight was a test of pure speed and will.',
]

function generateTypingPassage(): { text: string; words: string[] } {
  const text = TYPING_PASSAGES[Math.floor(Math.random() * TYPING_PASSAGES.length)]!
  return { text, words: text.split(' ') }
}

export default function RacePage({ mode, onFinish }: Props) {
  const { account, refreshAccount, addXp, addCoins } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const gameStateRef = useRef<{
    cars: CarState[]
    bots: BotConfig[]
    phase: GamePhase
    countdown: number
    timer: number
    question: { text: string; answer: number } | null
    typingState: { words: string[]; currentWordIdx: number; typed: string; passage: string } | null
    questionTimer: number
    questionActive: boolean
    finished: boolean
    winner: string | null
    playerFinished: boolean
    usedBoost: boolean
  }>({
    cars: [],
    bots: [],
    phase: 'countdown',
    countdown: 4,
    timer: 0,
    question: null,
    typingState: null,
    questionTimer: 0,
    questionActive: false,
    finished: false,
    winner: null,
    playerFinished: false,
    usedBoost: false,
  })

  const [uiState, setUiState] = useState({
    phase: 'countdown' as GamePhase | 'countdown',
    countdown: 4,
    question: null as { text: string; answer: number } | null,
    typingState: null as { words: string[]; currentWordIdx: number; typed: string; passage: string } | null,
    playerFuel: 0,
    playerDamage: 0,
    playerLaps: 0,
    playerSpeed: 0,
    standings: [] as { name: string; laps: number; color: string; isPlayer: boolean; finished: boolean }[],
    winner: null as string | null,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const [answer, setAnswer] = useState('')
  const [typingInput, setTypingInput] = useState('')
  const hasUsedBoost = useRef(false)

  function initRace() {
    const playerColor = account?.car.color ?? '#e23636'
    const playerDamage = account?.car.damage ?? 0
    const cars: CarState[] = [
      { name: PLAYER_NAME, progress: 0, speed: 0, fuel: 0, damage: playerDamage, laps: 0, color: playerColor, isPlayer: true, active: true, finishTime: null },
      ...BOT_CONFIGS.map(b => ({
        name: b.name, progress: 0, speed: 0, fuel: 0, damage: 0, laps: 0, color: b.color, isPlayer: false, active: true, finishTime: null,
      })),
    ]
    hasUsedBoost.current = false
    gameStateRef.current = {
      cars, bots: BOT_CONFIGS, phase: 'countdown', countdown: 4, timer: 0,
      question: null, typingState: null, questionTimer: 0, questionActive: false,
      finished: false, winner: null, playerFinished: false, usedBoost: false,
    }
  }

  function showNextQuestion() {
    const q = generateMathQuestion()
    gameStateRef.current.question = q
    gameStateRef.current.questionActive = true
    gameStateRef.current.questionTimer = 0
    setUiState(prev => ({ ...prev, question: q }))
    setAnswer('')
    inputRef.current?.focus()
  }

  function showTypingPassage() {
    const { text, words } = generateTypingPassage()
    gameStateRef.current.typingState = { words, currentWordIdx: 0, typed: '', passage: text }
    gameStateRef.current.questionActive = true
    gameStateRef.current.questionTimer = 0
    setUiState(prev => ({ ...prev, typingState: { words, currentWordIdx: 0, typed: '', passage: text } }))
    setTypingInput('')
    inputRef.current?.focus()
  }

  function handleMathAnswer(value: string) {
    const gs = gameStateRef.current
    if (!gs.question || !gs.questionActive) return

    const num = parseInt(value, 10)
    const playerCar = gs.cars[0]
    if (!playerCar) return

    if (num === gs.question.answer) {
      let bonus = FUEL_PER_CORRECT
      const boostItem = BOOSTS.find(b => {
        const inv = account?.inventory
        if (!inv) return false
        const key = `boost${b.tier.charAt(0).toUpperCase() + b.tier.slice(1)}` as keyof typeof inv
        return inv[key] > 0
      })
      if (boostItem && !hasUsedBoost.current) {
        bonus += boostItem.mathFuelBonus
        hasUsedBoost.current = true
      }
      playerCar.fuel = Math.min(100, playerCar.fuel + bonus)
    } else {
      playerCar.damage = Math.min(MAX_DAMAGE, playerCar.damage + DAMAGE_PER_WRONG)
    }

    gs.question = null
    gs.questionActive = false
    setUiState(prev => ({ ...prev, question: null }))
    setAnswer('')
  }

  function handleTypingInput(value: string) {
    const gs = gameStateRef.current
    const ts = gs.typingState
    if (!ts || !gs.questionActive) return

    const typed = value

    if (typed.endsWith(' ') || typed.endsWith('\n')) {
      const word = typed.trim()
      const targetWord = ts.words[ts.currentWordIdx]
      if (!targetWord) return

      const boostItem = account?.inventory && (
        (account.inventory.boostExtreme > 0 && account.inventory.boostLight > 0)
          ? BOOSTS.find(b => {
              if (b.tier === 'extreme' && account.inventory.boostExtreme > 0) return true
              if (b.tier === 'mid' && account.inventory.boostMid > 0) return true
              if (b.tier === 'light' && account.inventory.boostLight > 0) return true
              return false
            })
          : undefined
      )

      if (word === targetWord) {
        const bonus = boostItem && !hasUsedBoost.current ? boostItem.typingSkipWords : 0
        if (bonus > 0) hasUsedBoost.current = true
        const skipTo = Math.min(ts.words.length, ts.currentWordIdx + 1 + bonus)
        ts.currentWordIdx = skipTo

        const playerCar = gs.cars[0]
        if (playerCar) {
          playerCar.fuel = Math.min(100, playerCar.fuel + 3)
        }
      } else {
        const playerCar = gs.cars[0]
        if (playerCar) {
          playerCar.damage = Math.min(MAX_DAMAGE, playerCar.damage + DAMAGE_PER_TYPING_MISTAKE)
        }
        ts.currentWordIdx += 1
      }

      if (ts.currentWordIdx >= ts.words.length) {
        gs.typingState = null
        gs.questionActive = false
        setUiState(prev => ({ ...prev, typingState: null }))
        setTypingInput('')
      } else {
        setUiState(prev => ({
          ...prev,
          typingState: { ...ts },
        }))
        setTypingInput('')
      }
    } else {
      setTypingInput(typed)
    }
  }

  function handleTypingKey(e: React.KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const W = rect.width
    const H = rect.height

    const gs = gameStateRef.current
    const dt = 1 / 60

    // Countdown
    if (gs.phase === 'countdown') {
      gs.countdown -= dt
      if (gs.countdown <= 0) {
        gs.phase = 'racing'
        gs.timer = 0
      }
      setUiState(prev => ({ ...prev, countdown: Math.ceil(gs.countdown), phase: 'countdown' as const }))
    }

    // Racing
    if (gs.phase === 'racing' && !gs.finished) {
      gs.timer += dt

      const playerCar = gs.cars[0]

      // Player question logic
      if (playerCar && playerCar.active) {
        if (mode === 'math' && !gs.questionActive) {
          gs.questionTimer += dt
          if (gs.questionTimer > 1.5) showNextQuestion()
        }
        if (mode === 'typing' && !gs.questionActive) {
          gs.questionTimer += dt
          if (gs.questionTimer > 1.0) showTypingPassage()
        }
      }

      // Bot AI
      for (let i = 1; i < gs.cars.length; i++) {
        const car = gs.cars[i]
        const bot = gs.bots[i - 1]
        if (!car || !bot || !car.active) continue

        if (mode === 'math') {
          const correct = Math.random() < bot.skill
          if (correct) {
            car.fuel = Math.min(100, car.fuel + FUEL_PER_CORRECT * (0.5 + Math.random() * 0.5))
          } else {
            car.damage = Math.min(MAX_DAMAGE, car.damage + DAMAGE_PER_WRONG * (0.3 + Math.random() * 0.4))
          }
        } else {
          const correct = Math.random() < bot.skill
          if (correct) {
            car.fuel = Math.min(100, car.fuel + 2 + Math.random() * 2)
          } else {
            car.damage = Math.min(MAX_DAMAGE, car.damage + DAMAGE_PER_TYPING_MISTAKE * (0.5 + Math.random() * 0.5))
          }
        }
      }

      // Move cars
      for (const car of gs.cars) {
        if (!car.active) continue
        let speed = BASE_SPEED + (car.fuel / 100) * FUEL_SPEED_BONUS
        const damagePenalty = car.damage / MAX_DAMAGE
        speed *= (1 - damagePenalty * 0.7)
        car.speed = speed

        car.progress += speed * dt * 0.8
        car.fuel = Math.max(0, car.fuel - FUEL_DRAIN * dt * (1 + car.damage / MAX_DAMAGE))

        if (car.progress >= 1) {
          car.progress -= 1
          car.laps += 1
          if (car.laps >= TOTAL_LAPS) {
            car.active = false
            car.finishTime = gs.timer
            if (car.isPlayer) {
              gs.playerFinished = true
            }
            if (!gs.winner) {
              gs.winner = car.name
            }
          }
        }

        if (car.damage >= MAX_DAMAGE) {
          car.active = false
          car.finishTime = null
        }
      }

      // Check if all done
      const allFinished = gs.cars.every(c => !c.active)
      if (allFinished || gs.cars.filter(c => c.active).length === 0) {
        gs.finished = true
      }
    }

    // Render
    const cx = W / 2
    const cy = H / 2
    const rx = Math.min(W, H) * 0.35
    const ry = Math.min(W, H) * 0.2
    const trackWidth = Math.min(W, H) * 0.07

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, W, H)

    // Track grass
    ctx.fillStyle = '#16213e'
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx + trackWidth * 1.5, ry + trackWidth * 1.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Track surface (outer)
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx + trackWidth / 2, ry + trackWidth / 2, 0, 0, Math.PI * 2)
    ctx.strokeStyle = '#3a3a4e'
    ctx.lineWidth = trackWidth
    ctx.stroke()

    // Track surface (inner edge - lighter stripe)
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx - trackWidth / 2, ry - trackWidth / 2, 0, 0, Math.PI * 2)
    ctx.strokeStyle = '#4a4a5e'
    ctx.lineWidth = trackWidth * 0.05
    ctx.stroke()

    // Track surface (outer edge)
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx + trackWidth / 2, ry + trackWidth / 2, 0, 0, Math.PI * 2)
    ctx.strokeStyle = '#5a5a6e'
    ctx.lineWidth = trackWidth * 0.05
    ctx.stroke()

    // Lane lines (centerline dashes)
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([6, 8])
    ctx.stroke()
    ctx.setLineDash([])

    // Start/finish line
    const innerSx = cx + (rx - trackWidth / 2) * Math.cos(0)
    const innerSy = cy + (ry - trackWidth / 2) * Math.sin(0)
    const outerSx = cx + (rx + trackWidth / 2) * Math.cos(0)
    const outerSy = cy + (ry + trackWidth / 2) * Math.sin(0)

    for (let j = 0; j < 8; j++) {
      const t = j / 8
      const p1x = innerSx + (outerSx - innerSx) * t
      const p1y = innerSy + (outerSy - innerSy) * t
      ctx.fillStyle = j % 2 === 0 ? '#fff' : '#111'
      ctx.fillRect(p1x - 2, p1y - trackWidth * 0.2, 4, trackWidth * 0.4)
    }

    // Cars
    const carW = trackWidth * 0.5
    const carH = trackWidth * 0.25
    for (const car of gs.cars) {
      if (!car.active && car.finishTime === null) continue
      const angle = car.progress * Math.PI * 2
      const carX = cx + rx * Math.cos(angle)
      const carY = cy + ry * Math.sin(angle)

      ctx.save()
      ctx.translate(carX, carY)
      ctx.rotate(angle + Math.PI / 2)

      // Car body
      ctx.fillStyle = car.color
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.beginPath()
      ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 3)
      ctx.fill()
      ctx.shadowBlur = 0

      // Car outline
      ctx.strokeStyle = car.isPlayer ? '#fff' : 'rgba(255,255,255,0.3)'
      ctx.lineWidth = car.isPlayer ? 2 : 1
      ctx.beginPath()
      ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 3)
      ctx.stroke()

      // Player indicator
      if (car.isPlayer) {
        ctx.fillStyle = '#f1c40f'
        ctx.beginPath()
        ctx.arc(0, -carH / 2 - 4, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      // Name label
      ctx.fillStyle = car.isPlayer ? '#f0f6fc' : '#8b949e'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(car.name, carX, carY + carH + 14)
    }

    // Update UI state
    if (gs.cars[0]) {
      const p = gs.cars[0]
      const standings = [...gs.cars]
        .sort((a, b) => b.laps - a.laps || b.progress - a.progress)
        .map(c => ({
          name: c.name,
          laps: c.laps,
          color: c.color,
          isPlayer: c.isPlayer,
          finished: !c.active,
        }))

      setUiState(prev => ({
        ...prev,
        playerFuel: p.fuel,
        playerDamage: p.damage,
        playerLaps: p.laps,
        playerSpeed: p.speed,
        standings,
        winner: gs.winner,
      }))
    }

    animRef.current = requestAnimationFrame(gameLoop)
  }, [mode, account])

  useEffect(() => {
    initRace()
    animRef.current = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animRef.current)
  }, [mode])

  const playerCar = gameStateRef.current.cars[0]
  const currentStandings = uiState.standings

  function handleFinish() {
    const playerPos = currentStandings.findIndex(s => s.isPlayer) + 1
    const won = playerPos === 1

    addXp(won ? WIN_REWARD_XP : RACE_REWARD_XP)
    addCoins(won ? WIN_REWARD_COINS : RACE_REWARD_COINS)

    // Save race stats
    const username = getCurrentUsername()
    if (username) {
      updateAccount(username, (a) => {
        a.stats.racesDone += 1
        if (won) a.stats.wins += 1
        a.car.damage = playerCar ? Math.min(MAX_DAMAGE, playerCar.damage) : 0
        return a
      })
    }

    refreshAccount()
    onFinish()
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <span style={{ color: '#8b949e', fontSize: 13 }}>
          {mode === 'math' ? 'Math Mode' : 'Typing Mode'}
        </span>
        <span style={{ color: '#f0f6fc', fontWeight: 700, fontSize: 15 }}>
          Lap {Math.min(uiState.playerLaps + 1, TOTAL_LAPS)} / {TOTAL_LAPS}
        </span>
        <button onClick={onFinish} style={{ padding: '6px 16px', borderRadius: 6, background: '#21262d', color: '#e6edf3', fontSize: 13, border: '1px solid #30363d' }}>
          Quit
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Track */}
        <div style={{ flex: 1, position: 'relative' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

          {/* Question overlay */}
          {uiState.phase === 'countdown' && uiState.countdown > 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
              <span style={{ fontSize: 96, fontWeight: 900, color: uiState.countdown <= 1 ? '#f1c40f' : '#f0f6fc' }}>
                {uiState.countdown}
              </span>
            </div>
          )}

          {uiState.question && uiState.phase === 'racing' && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#161b22', borderRadius: 10, padding: '16px 24px', border: '1px solid #30363d', textAlign: 'center', minWidth: 280 }}>
              <p style={{ color: '#f0f6fc', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{uiState.question.text}</p>
              <form onSubmit={e => { e.preventDefault(); handleMathAnswer(answer) }}>
                <input
                  ref={inputRef}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  style={{ width: 120, padding: '8px 12px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3', fontSize: 18, textAlign: 'center' }}
                  placeholder="?"
                  autoFocus
                />
                <button type="submit" style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 6, background: '#238636', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                  Go
                </button>
              </form>
            </div>
          )}

          {uiState.typingState && uiState.phase === 'racing' && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#161b22', borderRadius: 10, padding: '16px 24px', border: '1px solid #30363d', textAlign: 'center', minWidth: 360, maxWidth: 500 }}>
              <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 8 }}>Type the passage:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
                {uiState.typingState.words.map((word, i) => (
                  <span key={i} style={{
                    padding: '2px 6px', borderRadius: 4, fontSize: 16, fontWeight: 600,
                    color: i < uiState.typingState!.currentWordIdx ? '#238636' : i === uiState.typingState!.currentWordIdx ? '#f0f6fc' : '#484f58',
                    background: i === uiState.typingState!.currentWordIdx ? 'rgba(35,134,54,0.15)' : 'transparent',
                  }}>{word}</span>
                ))}
              </div>
              <input
                ref={inputRef}
                value={typingInput}
                onChange={e => handleTypingInput(e.target.value)}
                onKeyDown={handleTypingKey}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#e6edf3', fontSize: 16 }}
                placeholder="Type here..."
                autoFocus
              />
            </div>
          )}

          {uiState.winner && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: uiState.winner === PLAYER_NAME ? '#f1c40f' : '#8b949e', marginBottom: 8 }}>
                {uiState.winner === PLAYER_NAME ? 'You Win!' : `${uiState.winner} Wins!`}
              </h2>
              <p style={{ color: '#8b949e', marginBottom: 20, fontSize: 14 }}>
                {currentStandings.findIndex(s => s.isPlayer) + 1}
                {['st','nd','rd','th'][Math.min(currentStandings.findIndex(s => s.isPlayer), 3)] ?? 'th'} place
              </p>
              <button onClick={handleFinish} style={{ padding: '12px 32px', borderRadius: 8, background: '#238636', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                Finish
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 200, background: '#161b22', borderLeft: '1px solid #30363d', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Player stats */}
          <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, border: '1px solid #30363d' }}>
            <p style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Your Car</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#8b949e' }}>Fuel</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: uiState.playerFuel > 50 ? '#39d152' : uiState.playerFuel > 20 ? '#f1c40f' : '#f85149' }}>
                {Math.round(uiState.playerFuel)}%
              </span>
            </div>
            <div style={{ height: 4, background: '#21262d', borderRadius: 2, marginBottom: 8 }}>
              <div style={{ width: `${uiState.playerFuel}%`, height: '100%', background: uiState.playerFuel > 50 ? '#39d152' : uiState.playerFuel > 20 ? '#f1c40f' : '#f85149', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#8b949e' }}>Damage</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: uiState.playerDamage > 50 ? '#f85149' : uiState.playerDamage > 20 ? '#f1c40f' : '#8b949e' }}>
                {Math.round(uiState.playerDamage)}%
              </span>
            </div>
            <div style={{ height: 4, background: '#21262d', borderRadius: 2 }}>
              <div style={{ width: `${uiState.playerDamage}%`, height: '100%', background: uiState.playerDamage > 50 ? '#f85149' : uiState.playerDamage > 20 ? '#f1c40f' : '#484f58', borderRadius: 2 }} />
            </div>
          </div>

          {/* Standings */}
          <div style={{ flex: 1, background: '#0d1117', borderRadius: 8, padding: 12, border: '1px solid #30363d', overflow: 'auto' }}>
            <p style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Standings</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentStandings.map((s, i) => (
                <div key={s.name} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px',
                  borderRadius: 4, background: s.isPlayer ? 'rgba(35,134,54,0.15)' : 'transparent',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#484f58', width: 16 }}>{i + 1}</span>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, border: '1px solid #30363d' }} />
                  <span style={{ fontSize: 12, fontWeight: s.isPlayer ? 700 : 400, color: '#e6edf3', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>L{s.laps}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
