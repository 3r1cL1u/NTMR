export type BoostTier = 'light' | 'mid' | 'extreme'
export type FixTier = 'light' | 'mid' | 'extreme'

export interface Inventory {
  boostLight: number
  boostMid: number
  boostExtreme: number
  fixLight: number
  fixMid: number
  fixExtreme: number
}

export interface CarState {
  color: string
  damage: number
}

export interface Account {
  username: string
  password: string
  coins: number
  xp: number
  achievements: string[]
  inventory: Inventory
  car: CarState
  stats: {
    racesDone: number
    wins: number
  }
  unlockedColors: string[]
}

export interface Achievement {
  id: string
  name: string
  desc: string
  check: (a: Account) => boolean
  reward: number
}

export interface BoostItem {
  tier: BoostTier
  name: string
  desc: string
  cost: number
  mathFuelBonus: number
  typingSkipWords: number
}

export interface FixItem {
  tier: FixTier
  name: string
  desc: string
  cost: number
  repairAmount: number
}

export type RaceMode = 'math' | 'typing'

export interface BotConfig {
  name: string
  skill: number
  color: string
}

export type GamePhase = 'countdown' | 'racing' | 'finished'
