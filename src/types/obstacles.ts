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
    // Static obstacles don't move
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

    // Move the obstacle
    this.position.x += this.velocity.x * this.direction * deltaTime

    // Reverse direction at boundaries
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
  const x = 70 + Math.random() * 260 // Better horizontal positioning

  if (rand < 0.4) {
    // Static obstacle - SHORTER heights (jumpable)
    const variant = ['debris', 'cable', 'panel'][Math.floor(Math.random() * 3)] as 'debris' | 'cable' | 'panel'
    
    // FIXED: Much shorter obstacles (15-25px) so player can jump over them
    const height = 15 + Math.random() * 10
    const width = 30 + Math.random() * 50
    
    return new StaticObstacle(
      id,
      { x, y: yPosition },
      { width, height },
      variant
    )
  } else if (rand < 0.7) {
    // Dynamic obstacle - SHORTER heights
    const variant = ['piston', 'swinging', 'sliding'][Math.floor(Math.random() * 3)] as 'piston' | 'swinging' | 'sliding'
    
    // FIXED: Shorter dynamic obstacles
    const height = 20 + Math.random() * 15
    const width = 40 + Math.random() * 20
    
    return new DynamicObstacle(
      id,
      { x, y: yPosition },
      { width, height },
      { x: 40 + difficulty * 15, y: 0 },
      { min: 70, max: 330 },
      variant
    )
  } else {
    // Timed obstacle - LOW height (lasers/spikes from floor)
    const variant = ['spike', 'laser', 'electric'][Math.floor(Math.random() * 3)] as 'spike' | 'laser' | 'electric'
    
    // FIXED: Very short timed obstacles (10-20px)
    const height = variant === 'laser' ? 8 : 12 + Math.random() * 8
    const width = 50 + Math.random() * 30
    
    return new TimedObstacle(
      id,
      { x, y: yPosition },
      { width, height },
      1.8 - difficulty * 0.2,
      0.8,
      variant
    )
  }
}