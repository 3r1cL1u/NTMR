import type { Account } from './types'
import { createAccount } from './constants'

const ACCOUNTS_KEY = 'nitro_accounts'
const CURRENT_KEY = 'nitro_current'

export function getAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY)
  return raw ? JSON.parse(raw) as Account[] : []
}

export function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_KEY)
}

export function setCurrentUsername(username: string) {
  localStorage.setItem(CURRENT_KEY, username)
}

export function clearCurrentUsername() {
  localStorage.removeItem(CURRENT_KEY)
}

export function findAccount(username: string): Account | undefined {
  return getAccounts().find(a => a.username === username)
}

export function updateAccount(username: string, updater: (a: Account) => Account): Account | null {
  const accounts = getAccounts()
  const idx = accounts.findIndex(a => a.username === username)
  if (idx === -1) return null
  const updated = updater(accounts[idx]!)
  accounts[idx] = updated
  saveAccounts(accounts)
  return updated
}

export function getCurrentAccount(): Account | null {
  const username = getCurrentUsername()
  if (!username) return null
  return findAccount(username) ?? null
}

export function simpleHash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h = ((h << 5) - h) + c
    h = h & h
  }
  return 'h' + Math.abs(h).toString(36)
}

export function registerAccount(username: string, password: string): string | null {
  if (username.length < 2) return 'Username must be at least 2 characters'
  if (password.length < 3) return 'Password must be at least 3 characters'
  if (findAccount(username)) return 'Username already taken'

  const account = createAccount(username, simpleHash(password))
  const accounts = getAccounts()
  accounts.push(account)
  saveAccounts(accounts)
  return null
}

export function loginAccount(username: string, password: string): string | null {
  const account = findAccount(username)
  if (!account) return 'Account not found'
  if (account.password !== simpleHash(password)) return 'Wrong password'
  setCurrentUsername(username)
  return null
}
