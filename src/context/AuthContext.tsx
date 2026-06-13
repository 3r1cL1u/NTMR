import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Account } from '../types'
import { findAccount, getCurrentUsername, setCurrentUsername, clearCurrentUsername, loginAccount, registerAccount, updateAccount } from '../storage'
import { ACHIEVEMENTS } from '../constants'

interface AuthContextType {
  account: Account | null
  login: (username: string, password: string) => string | null
  register: (username: string, password: string) => string | null
  logout: () => void
  refreshAccount: () => void
  addXp: (amount: number) => void
  addCoins: (amount: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => {
    const username = getCurrentUsername()
    if (!username) return null
    return findAccount(username) ?? null
  })

  const refreshAccount = useCallback(() => {
    const username = getCurrentUsername()
    if (!username) { setAccount(null); return }
    setAccount(findAccount(username) ?? null)
  }, [])

  const login = useCallback((username: string, password: string): string | null => {
    const err = loginAccount(username, password)
    if (err) return err
    refreshAccount()
    return null
  }, [refreshAccount])

  const register = useCallback((username: string, password: string): string | null => {
    const err = registerAccount(username, password)
    if (err) return err
    setCurrentUsername(username)
    refreshAccount()
    return null
  }, [refreshAccount])

  const logout = useCallback(() => {
    clearCurrentUsername()
    setAccount(null)
  }, [])

  const addXp = useCallback((amount: number) => {
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.xp += amount
      for (const ach of ACHIEVEMENTS) {
        if (!a.achievements.includes(ach.id) && ach.check(a)) {
          a.achievements.push(ach.id)
          a.coins += ach.reward
        }
      }
      return a
    })
    refreshAccount()
  }, [refreshAccount])

  const addCoins = useCallback((amount: number) => {
    const username = getCurrentUsername()
    if (!username) return
    updateAccount(username, (a) => {
      a.coins += amount
      return a
    })
    refreshAccount()
  }, [refreshAccount])

  return (
    <AuthContext.Provider value={{ account, login, register, logout, refreshAccount, addXp, addCoins }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
