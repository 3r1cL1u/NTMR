import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import MenuPage from './pages/MenuPage'
import LobbyPage from './pages/LobbyPage'
import RacePage from './pages/RacePage'
import GaragePage from './pages/GaragePage'
import ShopPage from './pages/ShopPage'
import AchievementsPage from './pages/AchievementsPage'
import { useState } from 'react'

export type Screen = 'menu' | 'lobby' | 'race' | 'garage' | 'shop' | 'achievements'

export default function App() {
  const { account } = useAuth()
  const [screen, setScreen] = useState<Screen>('menu')
  const [raceMode, setRaceMode] = useState<'math' | 'typing'>('math')

  if (!account) return <LoginPage />

  switch (screen) {
    case 'menu':
      return <MenuPage onNavigate={setScreen} />
    case 'lobby':
      return <LobbyPage mode={raceMode} setMode={setRaceMode} onStart={() => setScreen('race')} onBack={() => setScreen('menu')} />
    case 'race':
      return <RacePage mode={raceMode} onFinish={() => setScreen('menu')} />
    case 'garage':
      return <GaragePage onBack={() => setScreen('menu')} />
    case 'shop':
      return <ShopPage onBack={() => setScreen('menu')} />
    case 'achievements':
      return <AchievementsPage onBack={() => setScreen('menu')} />
  }
}
