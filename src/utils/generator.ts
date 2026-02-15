import type { ShaftSegment, IObstacle } from '@/types/game'
import { createRandomObstacle } from '@/types/obstacles'

export class ShaftGenerator {
  private segmentIdCounter = 0
  private obstacleIdCounter = 0
  private segmentHeight = 500
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

    // Determine number of obstacles based on difficulty
    const obstacleCount = Math.floor(1 + difficulty * 1.5) // Reduced from 2 + difficulty * 2
const minSpacing = 150 
    // FIXED: Generate obstacles WITHIN the segment going UPWARD
    // Since we're going up, obstacles should be spaced within this segment
    for (let i = 0; i < obstacleCount; i++) {
      // Obstacles positioned within the segment (yPosition to yPosition + segmentHeight)
      const obstacleY = yPosition + minSpacing + (i * (this.segmentHeight - minSpacing * 2) / Math.max(obstacleCount, 1))
      
      // Random chance to skip obstacle for variety
      if (Math.random() > 0.25 + difficulty * 0.15) {
        const obstacle = createRandomObstacle(
          `obstacle-${this.obstacleIdCounter++}`,
          obstacleY,
          difficulty
        )
        const tooClose = segment.obstacles.some(existing => {
          const horizontalDist = Math.abs(existing.position.x - obstacle.position.x)
          const verticalDist = Math.abs(existing.position.y - obstacle.position.y)
          return horizontalDist < 80 && verticalDist < 120
        })
        
        if (!tooClose) {
          segment.obstacles.push(obstacle)
        }
      }
    }

    return segment
  }

  // FIXED: Generate initial segments going UPWARD (decreasing Y for segments above)
   generateInitialSegments(count: number, startY: number = 0): ShaftSegment[] {
    const segments: ShaftSegment[] = []
    for (let i = 0; i < count; i++) {
      // Start with lower difficulty for initial segments
      const initialDifficulty = Math.min(i * 0.1, 0.3)
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

  constructor() {
    this.generator = new ShaftGenerator()
  }

  get(yPosition: number, difficulty: number): ShaftSegment {
    if (this.pool.length > 0) {
      const segment = this.pool.pop()!
      segment.position.y = yPosition
      segment.passed = false
      segment.obstacles = []
      
      // Regenerate obstacles with proper spacing
      const obstacleCount = Math.floor(1 + difficulty * 1.5)
      const segmentHeight = this.generator.getSegmentHeight()
      const minSpacing = 120
      
      for (let i = 0; i < obstacleCount; i++) {
        const obstacleY = yPosition + minSpacing + (i * (segmentHeight - minSpacing * 2) / Math.max(obstacleCount, 1))
        
        if (Math.random() > 0.25 + difficulty * 0.15) {
          const obstacle = createRandomObstacle(`obstacle-${Date.now()}-${i}`, obstacleY, difficulty)
          
          const tooClose = segment.obstacles.some(existing => {
            const horizontalDist = Math.abs(existing.position.x - obstacle.position.x)
            const verticalDist = Math.abs(existing.position.y - obstacle.position.y)
            return horizontalDist < 80 && verticalDist < 120
          })
          
          if (!tooClose) {
            segment.obstacles.push(obstacle)
          }
        }
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