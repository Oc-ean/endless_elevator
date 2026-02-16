import type { ShaftSegment, IObstacle } from '@/types/game'
import { createRandomObstacle } from '@/types/obstacles'

export class ShaftGenerator {
  private segmentIdCounter = 0
  private obstacleIdCounter = 0
  private segmentHeight = 550 
  private seed = Date.now()

  constructor(seed?: number) {
    if (seed) this.seed = seed
  }

  generateSegment(yPosition: number, difficulty: number): ShaftSegment {
    const segment: ShaftSegment = {
      id: `segment-${this.segmentIdCounter++}`,
      position: { x: 0, y: yPosition },
      obstacles: [],
      passed: false,
    }

    const obstacleCount = Math.floor(1 + Math.min(difficulty * 1.2, 4))
    const minSpacing = 180 

    for (let i = 0; i < obstacleCount; i++) {
      const segmentProgress = i / Math.max(obstacleCount - 1, 1)
      const obstacleY = yPosition + minSpacing + (segmentProgress * (this.segmentHeight - minSpacing * 2))
      
      if (Math.random() > 0.15 + difficulty * 0.1) {
        const obstacle = createRandomObstacle(
          `obstacle-${this.obstacleIdCounter++}`,
          obstacleY,
          difficulty
        )
        
        const tooClose = segment.obstacles.some(existing => {
          const horizontalDist = Math.abs(existing.position.x - obstacle.position.x)
          const verticalDist = Math.abs(existing.position.y - obstacle.position.y)
          
          if (obstacle.size.width > 100 || existing.size.width > 100) {
            return horizontalDist < 120 && verticalDist < 140
          }
          
          return horizontalDist < 90 && verticalDist < 130
        })
        
        if (!tooClose) {
          segment.obstacles.push(obstacle)
        }
      }
    }
    
    if (segment.obstacles.length === 0 && difficulty > 0.2) {
      const midY = yPosition + this.segmentHeight / 2
      segment.obstacles.push(
        createRandomObstacle(
          `obstacle-${this.obstacleIdCounter++}`,
          midY,
          difficulty * 0.7 
        )
      )
    }

    return segment
  }

  generateInitialSegments(count: number, startY: number = 0): ShaftSegment[] {
    const segments: ShaftSegment[] = []
    for (let i = 0; i < count; i++) {
      const initialDifficulty = Math.min(i * 0.08, 0.25)
      segments.push(this.generateSegment(startY - i * this.segmentHeight, initialDifficulty))
    }
    return segments
  }

  shouldGenerateNewSegment(topSegmentY: number, cameraY: number): boolean {
    return topSegmentY > cameraY - this.segmentHeight * 2
  }

  shouldRemoveSegment(segmentY: number, cameraY: number): boolean {
    return segmentY > cameraY + 800
  }

  getSegmentHeight(): number {
    return this.segmentHeight
  }
}

export class SegmentPool {
  private pool: ShaftSegment[] = []
  private generator: ShaftGenerator
  private obstacleCounter = 0

  constructor() {
    this.generator = new ShaftGenerator()
  }

  get(yPosition: number, difficulty: number): ShaftSegment {
    if (this.pool.length > 0) {
      const segment = this.pool.pop()!
      segment.position.y = yPosition
      segment.passed = false
      segment.obstacles = []
      
      const obstacleCount = Math.floor(1 + Math.min(difficulty * 1.2, 4))
      const segmentHeight = this.generator.getSegmentHeight()
      const minSpacing = 180
      
      for (let i = 0; i < obstacleCount; i++) {
        const segmentProgress = i / Math.max(obstacleCount - 1, 1)
        const obstacleY = yPosition + minSpacing + (segmentProgress * (segmentHeight - minSpacing * 2))
        
        if (Math.random() > 0.15 + difficulty * 0.1) {
          const obstacle = createRandomObstacle(
            `obstacle-${Date.now()}-${this.obstacleCounter++}`,
            obstacleY,
            difficulty
          )
          
          const tooClose = segment.obstacles.some(existing => {
            const horizontalDist = Math.abs(existing.position.x - obstacle.position.x)
            const verticalDist = Math.abs(existing.position.y - obstacle.position.y)
            
            if (obstacle.size.width > 100 || existing.size.width > 100) {
              return horizontalDist < 120 && verticalDist < 140
            }
            
            return horizontalDist < 90 && verticalDist < 130
          })
          
          if (!tooClose) {
            segment.obstacles.push(obstacle)
          }
        }
      }
      
      if (segment.obstacles.length === 0 && difficulty > 0.2) {
        const midY = yPosition + segmentHeight / 2
        segment.obstacles.push(
          createRandomObstacle(
            `obstacle-${Date.now()}-${this.obstacleCounter++}`,
            midY,
            difficulty * 0.7
          )
        )
      }
      
      return segment
    }
    
    return this.generator.generateSegment(yPosition, difficulty)
  }

  release(segment: ShaftSegment): void {
    if (this.pool.length < 10) {
      this.pool.push(segment)
    }
  }

  clear(): void {
    this.pool = []
  }
}