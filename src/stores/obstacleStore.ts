import type { IObstacle, Position, Size } from '@/types/game'
import { ObstacleType } from '@/types/game'

export class StaticObstacle implements IObstacle {
  id: string
  type = ObstacleType.STATIC
  position: Position
  size: Size
  active = true
  damage = 20
  variant: 'debris' | 'cable' | 'panel'

  constructor(id: string, position: Position, size: Size, variant: 'debris' | 'cable' | 'panel' = 'debris') {
    this.id = id
    this.position = position
    this.size = size
    this.variant = variant
  }

  onSpawn(): void {
    this.active = true
  }

  activate(): void {
    this.active = true
  }

  deactivate(): void {
    this.active = false
  }

  update(deltaTime: number): void {
  }
}

export class DynamicObstacle implements IObstacle {
  id: string
  type = ObstacleType.DYNAMIC
  position: Position
  size: Size
  active = true
  damage = 25
  velocity: Position
  range: { min: number; max: number }
  direction: number = 1
  variant: 'piston' | 'swinging' | 'sliding'

  constructor(
    id: string,
    position: Position,
    size: Size,
    velocity: Position,
    range: { min: number; max: number },
    variant: 'piston' | 'swinging' | 'sliding' = 'piston'
  ) {
    this.id = id
    this.position = position
    this.size = size
    this.velocity = velocity
    this.range = range
    this.variant = variant
  }

  onSpawn(): void {
    this.active = true
    this.direction = 1
  }

  activate(): void {
    this.active = true
  }

  deactivate(): void {
    this.active = false
  }

  update(deltaTime: number): void {
    if (!this.active) return

    this.position.x += this.velocity.x * this.direction * deltaTime

    if (this.position.x >= this.range.max) {
      this.direction = -1
      this.position.x = this.range.max
    } else if (this.position.x <= this.range.min) {
      this.direction = 1
      this.position.x = this.range.min
    }
  }
}

export class TimedObstacle implements IObstacle {
  id: string
  type = ObstacleType.TIMED
  position: Position
  size: Size
  active = false
  damage = 30
  interval: number
  activeTime: number
  timer: number = 0
  variant: 'spike' | 'laser' | 'electric'

  constructor(
    id: string,
    position: Position,
    size: Size,
    interval: number,
    activeTime: number,
    variant: 'spike' | 'laser' | 'electric' = 'spike'
  ) {
    this.id = id
    this.position = position
    this.size = size
    this.interval = interval
    this.activeTime = activeTime
    this.variant = variant
  }

  onSpawn(): void {
    this.timer = 0
    this.active = false
  }

  activate(): void {
    this.active = true
    this.timer = 0
  }

  deactivate(): void {
    this.active = false
  }

  update(deltaTime: number): void {
    this.timer += deltaTime

    if (this.active && this.timer >= this.activeTime) {
      this.active = false
      this.timer = 0
    } else if (!this.active && this.timer >= this.interval) {
      this.active = true
      this.timer = 0
    }
  }
}

export function createRandomObstacle(id: string, yPosition: number, difficulty: number): IObstacle {
  const rand = Math.random()
  const x = 50 + Math.random() * 300

  if (rand < 0.4) {
    const variant = ['debris', 'cable', 'panel'][Math.floor(Math.random() * 3)] as 'debris' | 'cable' | 'panel'
    return new StaticObstacle(
      id,
      { x, y: yPosition },
      { width: 40 + Math.random() * 40, height: 30 + Math.random() * 30 },
      variant
    )
  } else if (rand < 0.7) {
    const variant = ['piston', 'swinging', 'sliding'][Math.floor(Math.random() * 3)] as 'piston' | 'swinging' | 'sliding'
    return new DynamicObstacle(
      id,
      { x, y: yPosition },
      { width: 50, height: 40 },
      { x: 50 + difficulty * 20, y: 0 },
      { min: 50, max: 350 },
      variant
    )
  } else {
    // Timed obstacle
    const variant = ['spike', 'laser', 'electric'][Math.floor(Math.random() * 3)] as 'spike' | 'laser' | 'electric'
    return new TimedObstacle(
      id,
      { x, y: yPosition },
      { width: 60, height: 20 },
      2.0 - difficulty * 0.3,
      1.0,
      variant
    )
  }
}