import { apiFetch, setToken, clearToken } from './client'
import { AuthUser } from '@/lib/types'

type TipoAcesso = 'ORGANIZADOR' | 'CLIENTE' | 'PORTARIA'

type LoginResponseDto = { token: string; tipoAcesso: TipoAcesso }
type MeResponseDto = { id: string; nome: string; sobrenome: string; email: string; tipoAcesso: TipoAcesso }
type LogoutResponseDto = { message: string }

const ROLE_BY_TIPO_ACESSO: Record<TipoAcesso, AuthUser['role']> = {
  ORGANIZADOR: 'organizer',
  CLIENTE: 'customer',
  PORTARIA: 'gate',
}

function mapMeResponse(dto: MeResponseDto): AuthUser {
  return {
    id: dto.id,
    name: `${dto.nome} ${dto.sobrenome}`,
    email: dto.email,
    role: ROLE_BY_TIPO_ACESSO[dto.tipoAcesso],
  }
}

export async function login(email: string, senha: string): Promise<void> {
  const response = await apiFetch<LoginResponseDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
  setToken(response.token)
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiFetch<MeResponseDto>('/auth/me')
  return mapMeResponse(response)
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<LogoutResponseDto>('/auth/logout', { method: 'POST' })
  } catch {
    // best-effort — the local session is cleared regardless below
  } finally {
    clearToken()
  }
}
