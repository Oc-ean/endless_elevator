import type { IEvent } from '@/types/game'
import { EventType } from '@/types/game'

export class PowerCutEvent implements IEvent {
  type = EventType.POWER_CUT
  duration = 5
  active = false
  probability = 0.3
  elapsed = 0

  activate(): void {
    this.active = true
    this.elapsed = 0
  }

  deactivate(): void {
    this.active = false
    this.elapsed = 0
  }

  update(deltaTime: number): boolean {
    if (!this.active) return false
    this.elapsed += deltaTime
    return this.elapsed >= this.duration
  }
}

export class MonsterEncounterEvent implements IEvent {
  type = EventType.MONSTER_ENCOUNTER
  duration = 8
  active = false
  probability = 0.2
  elapsed = 0
  monsterPosition = { x: -100, y: 300 }
  monsterVelocity = { x: 50, y: 0 }

  activate(): void {
    this.active = true
    this.elapsed = 0
    this.monsterPosition = { x: -100, y: 300 }
  }

  deactivate(): void {
    this.active = false
    this.elapsed = 0
  }

  update(deltaTime: number): boolean {
    if (!this.active) return false
    this.elapsed += deltaTime
    
    // Move monster
    this.monsterPosition.x += this.monsterVelocity.x * deltaTime
    
    // Monster moves back and forth
    if (this.monsterPosition.x > 500) {
      this.monsterVelocity.x = -50
    } else if (this.monsterPosition.x < -100) {
      this.monsterVelocity.x = 50
    }

    return this.elapsed >= this.duration
  }
}

export class TrapModeEvent implements IEvent {
  type = EventType.TRAP_MODE
  duration = 6
  active = false
  probability = 0.25
  elapsed = 0

  activate(): void {
    this.active = true
    this.elapsed = 0
  }

  deactivate(): void {
    this.active = false
    this.elapsed = 0
  }

  update(deltaTime: number): boolean {
    if (!this.active) return false
    this.elapsed += deltaTime
    return this.elapsed >= this.duration
  }
}

export class SpeedBoostEvent implements IEvent {
  type = EventType.SPEED_BOOST
  duration = 4
  active = false
  probability = 0.25
  elapsed = 0

  activate(): void {
    this.active = true
    this.elapsed = 0
  }

  deactivate(): void {
    this.active = false
    this.elapsed = 0
  }

  update(deltaTime: number): boolean {
    if (!this.active) return false
    this.elapsed += deltaTime
    return this.elapsed >= this.duration
  }
}

export class EventManager {
  private events: IEvent[] = []
  private cooldown = 0
  private cooldownDuration = 10
  private lastEventTime = 0

  constructor() {
    this.events = [
      new PowerCutEvent(),
      new MonsterEncounterEvent(),
      new TrapModeEvent(),
      new SpeedBoostEvent(),
    ]
  }

  update(deltaTime: number, gameTime: number): IEvent | null {
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown -= deltaTime
      return null
    }

    // Check if enough time has passed
    if (gameTime - this.lastEventTime < this.cooldownDuration) {
      return null
    }

    // Random chance to trigger event
    if (Math.random() < 0.02) {
      const event = this.selectRandomEvent()
      if (event) {
        this.lastEventTime = gameTime
        this.cooldown = this.cooldownDuration
        return event
      }
    }

    return null
  }

  private selectRandomEvent(): IEvent | null {
    const totalProbability = this.events.reduce((sum, e) => sum + e.probability, 0)
    let random = Math.random() * totalProbability

    for (const event of this.events) {
      random -= event.probability
      if (random <= 0) {
        return event
      }
    }

    return null
  }

  getActiveEvent(): IEvent | null {
    return this.events.find(e => e.active) || null
  }
}