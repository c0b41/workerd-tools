declare module 'docker-names' {
  function getRandomName(): string
}

declare module '*.txt' {
  const value: string
  export default value
}
