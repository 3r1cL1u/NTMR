import type { Account, BoostItem, FixItem, Achievement, BotConfig } from './types'

export const STARTING_COINS = 100
export const RACE_REWARD_COINS = 50
export const WIN_REWARD_COINS = 150
export const RACE_REWARD_XP = 20
export const WIN_REWARD_XP = 50
export const MAX_DAMAGE = 100
export const LAPS_TO_WIN = 3
export const TRACK_LENGTH = 1000
export const PLAYER_NAME = 'You'

export const CAR_COLORS: { name: string; hex: string; cost: number }[] = [
  { name: 'Racing Red', hex: '#e23636', cost: 0 },
  { name: 'Speed Blue', hex: '#1a6be3', cost: 0 },
  { name: 'Midnight Black', hex: '#1a1a1a', cost: 200 },
  { name: 'Neon Green', hex: '#39d152', cost: 300 },
  { name: 'Sunset Orange', hex: '#e37e1a', cost: 350 },
  { name: 'Purple Storm', hex: '#8e44ad', cost: 400 },
  { name: 'Gold Rush', hex: '#f1c40f', cost: 500 },
  { name: 'Cyber Pink', hex: '#e84393', cost: 600 },
  { name: 'Ice White', hex: '#ecf0f1', cost: 250 },
  { name: 'Toxic Yellow', hex: '#f1c40f', cost: 450 },
]

export const BOOSTS: BoostItem[] = [
  { tier: 'light', name: 'Light Boost', desc: '+10 fuel in math, skip 2 words typing', cost: 50, mathFuelBonus: 10, typingSkipWords: 2 },
  { tier: 'mid', name: 'Mid Boost', desc: '+25 fuel in math, skip 5 words typing', cost: 150, mathFuelBonus: 25, typingSkipWords: 5 },
  { tier: 'extreme', name: 'Extreme Boost', desc: '+50 fuel in math, skip 10 words typing', cost: 400, mathFuelBonus: 50, typingSkipWords: 10 },
]

export const FIXES: FixItem[] = [
  { tier: 'light', name: 'Light Fix', desc: 'Repair 20 damage', cost: 30, repairAmount: 20 },
  { tier: 'mid', name: 'Mid Fix', desc: 'Repair 50 damage', cost: 80, repairAmount: 50 },
  { tier: 'extreme', name: 'Extreme Fix', desc: 'Repair 100 damage', cost: 200, repairAmount: 100 },
]

export function defaultInventory() {
  return { boostLight: 0, boostMid: 0, boostExtreme: 0, fixLight: 0, fixMid: 0, fixExtreme: 0 }
}

export function createAccount(username: string, password: string): Account {
  return {
    username,
    password,
    coins: STARTING_COINS,
    xp: 0,
    achievements: [],
    inventory: defaultInventory(),
    car: { color: '#e23636', damage: 0 },
    stats: { racesDone: 0, wins: 0 },
    unlockedColors: ['#e23636', '#1a6be3'],
  }
}

export const BOT_CONFIGS: BotConfig[] = [
  { name: 'Speedy Sam', skill: 0.7, color: '#e67e22' },
  { name: 'Nitro Nick', skill: 0.85, color: '#2ecc71' },
  { name: 'Tank Tina', skill: 0.5, color: '#9b59b6' },
  { name: 'Bash Bob', skill: 0.6, color: '#e74c3c' },
]

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_race', name: 'First Race', desc: 'Complete your first race', check: a => a.stats.racesDone >= 1, reward: 50 },
  { id: 'ten_races', name: 'Getting Started', desc: 'Complete 10 races', check: a => a.stats.racesDone >= 10, reward: 200 },
  { id: 'fifty_races', name: 'Veteran Racer', desc: 'Complete 50 races', check: a => a.stats.racesDone >= 50, reward: 500 },
  { id: 'first_win', name: 'First Victory', desc: 'Win your first race', check: a => a.stats.wins >= 1, reward: 100 },
  { id: 'ten_wins', name: 'Champion', desc: 'Win 10 races', check: a => a.stats.wins >= 10, reward: 500 },
  { id: 'twenty_wins', name: 'Legend', desc: 'Win 20 races', check: a => a.stats.wins >= 20, reward: 1000 },
  { id: 'hundred_xp', name: 'Learning', desc: 'Earn 100 XP', check: a => a.xp >= 100, reward: 200 },
  { id: 'thousand_xp', name: 'Scholar', desc: 'Earn 1000 XP', check: a => a.xp >= 1000, reward: 1000 },
  { id: 'no_damage', name: 'Perfect Run', desc: 'Win a race without taking damage', check: () => false, reward: 300 },
  { id: 'five_achievements', name: 'Collector', desc: 'Unlock 5 achievements', check: a => a.achievements.length >= 5, reward: 400 },
]
