declare module 'better-auth/providers/google' {
  interface GoogleProviderOptions {
    clientId: string
    clientSecret: string
    redirectUri?: string
    scopes?: string[]
  }

  export function google(options: GoogleProviderOptions): unknown
}
