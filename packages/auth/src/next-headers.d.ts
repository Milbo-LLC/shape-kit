declare module 'next/headers' {
  export function headers(): Headers
  export function cookies(): {
    get(name: string): { value?: string } | undefined
  }
}
