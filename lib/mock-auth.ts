export const MOCK_USER = {
  username: 'admin',
  password: 'admin1234',
  role: 'ADMIN' as const,
  name: 'ผู้ดูแลระบบ',
}

export type MockSession = {
  role: 'ADMIN' | 'TENANT' | 'USER'
  name: string
}

export function setMockSession(session: MockSession) {
  document.cookie = `mock_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=86400`
}

export function clearMockSession() {
  document.cookie = 'mock_session=; path=/; max-age=0'
}

export function getMockSession(): MockSession | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)mock_session=([^;]*)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1])) as MockSession
  } catch {
    return null
  }
}
