import type { AuthenticatorTransportFuture } from '@simplewebauthn/types'

export type Credential = {
  id: string
  userId: string
  publicKey: Buffer
  counter: number
  transports?: AuthenticatorTransportFuture[]
}
