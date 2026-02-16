import type { Position, Size, Player, IObstacle } from '@/types/game'

export interface CollisionBox {
  x: number
  y: number
  width: number
  height: number
}

export class PhysicsEngine {
  gravity = 1300 
  friction = 0.86
  jumpForce = -600
  dashSpeed = 350
  moveSpeed = 210
 airControl = 0.6


  private jumpBufferTime = 0.14 
  private coyoteTime = 0.10 
  private jumpBuffer = 0
  private coyoteTimer = 0
  private wasGrounded = false

  applyGravity(player: Player, deltaTime: number, groundY: number): void {
    if (player.velocity.y < 0 && player.velocity.y > -300) {
      player.velocity.y += this.gravity * deltaTime * 0.5 
    } else {
      player.velocity.y += this.gravity * deltaTime
    }

    player.position.y += player.velocity.y * deltaTime

    const distanceToGround = Math.abs(player.position.y + player.size.height - groundY)
    const isGrounded = distanceToGround < 10 && player.velocity.y >= 0

    if (isGrounded) {
      player.position.y = groundY - player.size.height
      player.velocity.y = 0
      player.canJump = true
      this.coyoteTimer = this.coyoteTime
      this.wasGrounded = true
    } else {
      if (this.wasGrounded) {
        this.coyoteTimer -= deltaTime
        if (this.coyoteTimer <= 0) {
          this.wasGrounded = false
          player.canJump = false
        }
      }
    }
    
    // Jump buffer countdown
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= deltaTime
    }
  }

  applyHorizontalMovement(player: Player, deltaTime: number, isInAir: boolean = false): void {
    const currentFriction = isInAir ? 0.94 : this.friction
    player.velocity.x *= currentFriction

    player.position.x += player.velocity.x * deltaTime

    const minX = 50
    const maxX = 350

    if (player.position.x < minX) {
      player.position.x = minX
      player.velocity.x = 0
    } else if (player.position.x + player.size.width > maxX) {
      player.position.x = maxX - player.size.width
      player.velocity.x = 0
    }
  }

  jump(player: Player): void {
    if (!player.canJump && this.coyoteTimer <= 0) {
      this.jumpBuffer = this.jumpBufferTime
      return
    }
    
    if (player.canJump || this.coyoteTimer > 0) {
      player.velocity.y = this.jumpForce
      player.canJump = false
      this.coyoteTimer = 0
      this.wasGrounded = false
      this.jumpBuffer = 0
    }
  }
  
  updateJumpBuffer(player: Player, deltaTime: number): void {
    if (this.jumpBuffer > 0 && player.canJump) {
      this.jump(player)
    }
  }

  dash(player: Player, direction: number): void {
    if (!player.isDashing) {
      player.velocity.x = this.dashSpeed * direction
         if (player.canJump) {
        player.velocity.y = 0
      }
      player.isDashing = true
      setTimeout(() => {
        player.isDashing = false
      }, 200)
    }
  }

moveLeft(player: Player, isInAir: boolean = false): void {
    if (player.isDashing) return
    
    const speed = isInAir ? this.moveSpeed * this.airControl : this.moveSpeed
    player.velocity.x = -speed
  }

  moveRight(player: Player, isInAir: boolean = false): void {
    if (player.isDashing) return
    
    const speed = isInAir ? this.moveSpeed * this.airControl : this.moveSpeed
    player.velocity.x = speed
  }


  crouch(player: Player, crouching: boolean): void {
    player.isCrouching = crouching
    if (crouching) {
      const originalHeight = 70
      const crouchHeight = 35
      const heightDiff = originalHeight - crouchHeight
      player.size.height = crouchHeight
      player.position.y += heightDiff
      if (player.velocity.y > 0) {
        player.velocity.y *= 1.3
      }
    } else {
      const originalHeight = 70
      const currentHeight = player.size.height
      const heightDiff = originalHeight - currentHeight
      player.size.height = originalHeight
      player.position.y -= heightDiff
    }
  }
}



export class CollisionDetector {
  checkEllipseRectCollision(
    ellipseCenterX: number,
    ellipseCenterY: number,
    radiusX: number,
    radiusY: number,
    rect: CollisionBox
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(ellipseCenterX, rect.x + rect.width))
    const closestY = Math.max(rect.y, Math.min(ellipseCenterY, rect.y + rect.height))

    const dx = (ellipseCenterX - closestX) / radiusX
    const dy = (ellipseCenterY - closestY) / radiusY

  
    const baseMargin = 0.7
    return (dx * dx + dy * dy) < (baseMargin * baseMargin)

  }

  checkCollision(box1: CollisionBox, box2: CollisionBox): boolean {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    )
  }

  getPlayerEllipse(player: Player): { 
    centerX: number
    centerY: number
    radiusX: number
    radiusY: number 
  } {
    let hitboxMargin = 12 
    
    if (player.velocity.y < -250) { 
      hitboxMargin = 16
    } else if (player.velocity.y < -100) { 
      hitboxMargin = 16
    }
    
    if (player.isCrouching) {
      hitboxMargin += 8
    }
    
    return {
      centerX: player.position.x + player.size.width / 2,
      centerY: player.position.y + player.size.height / 2,
      radiusX: (player.size.width / 2) - hitboxMargin,
      radiusY: (player.size.height / 2) - hitboxMargin,
    }
  }

  getPlayerBox(player: Player): CollisionBox {
    const margin = 12
    return {
      x: player.position.x + margin,
      y: player.position.y + margin,
      width: player.size.width - margin * 2,
      height: player.size.height - margin * 2,
    }
  }

  getObstacleBox(obstacle: IObstacle): CollisionBox {
    const obstacleMargin = 3
    return {
      x: obstacle.position.x + obstacleMargin,
      y: obstacle.position.y + obstacleMargin,
      width: obstacle.size.width - obstacleMargin * 2,
      height: obstacle.size.height - obstacleMargin * 2,
    }
  }

 checkPlayerObstacleCollision(player: Player, obstacle: IObstacle): boolean {
    if (!obstacle.active) return false
    

    const playerBottom = player.position.y + player.size.height
    const playerTop = player.position.y
    const obstacleTop = obstacle.position.y
    const obstacleBottom = obstacle.position.y + obstacle.size.height
    

    if (player.velocity.y < -230) {
      if (playerBottom < obstacleTop + 28) {
        return false 
      }
      
      if (playerTop < obstacleBottom - obstacle.size.height * 0.4) {
        return false 
      }
    }
    
    if (player.velocity.y < -100 && obstacle.size.height < 35) {
      const verticalClearance = obstacleTop - playerBottom
      if (verticalClearance > -15) { 
        return false
      }
    }
    
    const playerEllipse = this.getPlayerEllipse(player)
    const obstacleBox = this.getObstacleBox(obstacle)
    
    return this.checkEllipseRectCollision(
      playerEllipse.centerX,
      playerEllipse.centerY,
      playerEllipse.radiusX,
      playerEllipse.radiusY,
      obstacleBox
    )
  }

  checkNearMiss(player: Player, obstacle: IObstacle, threshold: number = 40): boolean {
    if (!obstacle.active) return false

    const playerEllipse = this.getPlayerEllipse(player)
    const obstacleBox = this.getObstacleBox(obstacle)

    const isNear = this.checkEllipseRectCollision(
      playerEllipse.centerX,
      playerEllipse.centerY,
      playerEllipse.radiusX + threshold,
      playerEllipse.radiusY + threshold,
      obstacleBox
    )
    
    const isColliding = this.checkPlayerObstacleCollision(player, obstacle)

    return isNear && !isColliding
  }
}