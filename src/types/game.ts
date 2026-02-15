export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  EVENT_ACTIVE = 'EVENT_ACTIVE',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum EventType {
  POWER_CUT = 'POWER_CUT',
  MONSTER_ENCOUNTER = 'MONSTER_ENCOUNTER',
  TRAP_MODE = 'TRAP_MODE',
  SPEED_BOOST = 'SPEED_BOOST',
}

export enum ObstacleType {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
  TIMED = 'TIMED',
}

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface IObstacle {
  id: string
  type: ObstacleType
  position: Position
  size: Size
  active: boolean
  damage: number
  onSpawn(): void
  activate(): void
  deactivate(): void
  update(deltaTime: number): void
}

export interface IEvent {
  type: EventType
  duration: number
  active: boolean
  probability: number
  activate(): void
  deactivate(): void
}

export interface GameEvent {
  id: string
  name: string
  description: string
  duration: number
  weight: number
  onStart(): void
  onEnd(): void
  update(deltaTime: number): void
}

export interface Player {
  position: Position
  velocity: Position
  size: Size
  health: number
  maxHealth: number
  canJump: boolean
  isDashing: boolean
  isCrouching: boolean
}

export interface ShaftSegment {
  id: string
  position: Position
  obstacles: IObstacle[]
  passed: boolean
}

export interface GameStats {
  score: number
  floors: number
  distance: number
  timeAlive: number
  nearMisses: number
  perfectSegments: number
  highScore: number
}

export interface DifficultyConfig {
  baseSpeed: number
  speedMultiplier: number
  obstacleFrequency: number
  eventFrequency: number
  reactionTime: number
}