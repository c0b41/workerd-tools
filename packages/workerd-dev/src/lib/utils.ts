export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function requireUncached(module: string) {
  delete require.cache[require.resolve(module)]
  return require(module)
}
