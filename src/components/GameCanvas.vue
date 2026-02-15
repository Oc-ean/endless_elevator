<template>
    <div class="relative w-full h-screen bg-cyber-darker overflow-hidden">
        <!-- Game Canvas -->
        <canvas ref="canvasRef" class="w-full h-full" :class="{ 'filter-dark': isPowerCut }"></canvas>

        <transition name="fade">
            <div v-if="showHints"
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                <div
                    class="bg-cyber-darker/90 border-2 border-neon-cyan p-4 md:p-6 backdrop-blur-sm text-center animate-glow-pulse max-w-sm">
                    <div class="hidden md:block">
                        <div class="font-display text-neon-cyan text-xl mb-4">USE ARROW KEYS ←→ TO MOVE</div>
                        <div class="font-display text-neon-pink text-xl mb-4">SPACE TO JUMP</div>
                    </div>
                    <div class="md:hidden">
                        <div class="font-display text-neon-cyan text-lg mb-3">TAP SCREEN TO JUMP</div>
                        <div class="font-display text-neon-pink text-lg mb-3">SWIPE LEFT/RIGHT TO MOVE</div>
                    </div>
                    <div class="font-body text-neon-yellow text-sm mt-4">
                        ⬇️ YOU ARE THE GLOWING CYAN BOX ⬇️
                    </div>
                </div>
            </div>
        </transition>

        <div class="md:hidden absolute inset-0 pointer-events-none z-20">
            <transition name="fade">
                <div v-if="showTouchZones" class="w-full h-full">
                    <div class="absolute inset-0 bg-neon-cyan/5 border-2 border-neon-cyan/30">
                        <div
                            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neon-cyan text-sm font-display">
                            TAP ANYWHERE TO JUMP
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <GameHUD />

        <EventOverlay v-if="gameStore.currentEvent" :event="gameStore.currentEvent" />

        <PauseMenu v-if="gameStore.gameState === GameStateEnum.PAUSED" />

        <GameOverScreen v-if="gameStore.gameState === GameStateEnum.GAME_OVER" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { GameState as GameStateEnum, EventType } from '@/types/game'
import { PhysicsEngine, CollisionDetector } from '@/utils/physics'
import { ShaftGenerator, SegmentPool } from '@/utils/generator'
import { EventManager } from '@/utils/events'
import { drawPlayer } from '@/utils/drawPlayer'
import { drawMonster } from '@/utils/drawMonster'
import GameHUD from './GameHUD.vue'
import EventOverlay from './EventOverlay.vue'
import PauseMenu from './PauseMenu.vue'
import GameOverScreen from './GameOver.vue'

const gameStore = useGameStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const physics = new PhysicsEngine()
const showHints = ref(true)
const showTouchZones = ref(true)

const collision = new CollisionDetector()
const generator = new ShaftGenerator()
const segmentPool = new SegmentPool()
const eventManager = new EventManager()

let ctx: CanvasRenderingContext2D | null = null
let animationFrameId: number | null = null
let lastTime = 0
let keysPressed = new Set<string>()
let nearMissTracked = new Set<string>()
let damageTimeout: number | null = null

let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0
const SWIPE_THRESHOLD = 30
const TAP_TIME_THRESHOLD = 200

const isPowerCut = computed(() =>
    gameStore.currentEvent?.type === EventType.POWER_CUT
)

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        if (gameStore.isPlaying) {
            gameStore.pauseGame()
        } else if (gameStore.gameState === GameStateEnum.PAUSED) {
            gameStore.resumeGame()
        }
        return
    }

    if (!gameStore.isPlaying) return
    keysPressed.add(e.key)

    if (e.key === ' ') {
        e.preventDefault()
        debugJump()
        physics.jump(gameStore.player)
    }
}

const debugJump = () => {
    console.log('Jump debug:');
    console.log('Player position:', gameStore.player.position);
    console.log('Player velocity:', gameStore.player.velocity);
    console.log('Player isCrouching:', gameStore.player.isCrouching);
    console.log('Camera offset:', gameStore.cameraOffset);
}

const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.delete(e.key)

    if (e.key === 'ArrowDown') {
        physics.crouch(gameStore.player, false)
    }
}

const handleTouchStart = (e: TouchEvent) => {
    if (!gameStore.isPlaying) return

    const touch = e.touches[0]!
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    touchStartTime = Date.now()
}

const handleTouchMove = (e: TouchEvent) => {
    if (!gameStore.isPlaying) return
    e.preventDefault()

    const touch = e.touches[0]!
    const deltaX = touch.clientX - touchStartX
    const deltaY = touch.clientY - touchStartY

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
            keysPressed.add('ArrowRight')
            keysPressed.delete('ArrowLeft')
        } else {
            keysPressed.add('ArrowLeft')
            keysPressed.delete('ArrowRight')
        }
    } else {
        keysPressed.delete('ArrowLeft')
        keysPressed.delete('ArrowRight')
    }
}

const handleTouchEnd = (e: TouchEvent) => {
    if (!gameStore.isPlaying) return

    const touchDuration = Date.now() - touchStartTime
    const touch = e.changedTouches[0]!
    const deltaX = Math.abs(touch.clientX - touchStartX)
    const deltaY = Math.abs(touch.clientY - touchStartY)

    if (touchDuration < TAP_TIME_THRESHOLD && deltaX < SWIPE_THRESHOLD && deltaY < SWIPE_THRESHOLD) {
        physics.jump(gameStore.player)
    }

    keysPressed.delete('ArrowLeft')
    keysPressed.delete('ArrowRight')
}

const gameLoop = (currentTime: number) => {
    if (!ctx || !gameStore.isPlaying) {
        animationFrameId = requestAnimationFrame(gameLoop)
        return
    }

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
    lastTime = currentTime

    update(deltaTime)

    render()

    animationFrameId = requestAnimationFrame(gameLoop)
}

const update = (deltaTime: number) => {
    handleInput()

    const playerScreenY = gameStore.player.position.y - gameStore.cameraOffset
    const canvasBottom = ctx ? ctx.canvas.height - 100 : 500
    const isInAir = playerScreenY < canvasBottom || gameStore.player.velocity.y !== 0

    const groundY = gameStore.cameraOffset + canvasBottom

    physics.applyGravity(gameStore.player, deltaTime, groundY)
    physics.applyHorizontalMovement(gameStore.player, deltaTime, isInAir)
    const leftWall = 50
    const rightWall = ctx ? ctx.canvas.width - 50 : 400

    if (gameStore.player.position.x < leftWall) {
        gameStore.player.position.x = leftWall
        gameStore.player.velocity.x = 0
    }
    if (gameStore.player.position.x + gameStore.player.size.width > rightWall) {
        gameStore.player.position.x = rightWall - gameStore.player.size.width
        gameStore.player.velocity.x = 0
    }

    const screenTop = gameStore.cameraOffset + 100
    const screenBottom = groundY

    if (gameStore.player.position.y < screenTop) {
        gameStore.player.position.y = screenTop
        gameStore.player.velocity.y = Math.max(0, gameStore.player.velocity.y)
    }

    if (gameStore.player.position.y + gameStore.player.size.height > screenBottom) {
        gameStore.player.position.y = screenBottom - gameStore.player.size.height
        gameStore.player.velocity.y = 0
        gameStore.player.canJump = true
    }

    gameStore.cameraOffset -= gameStore.elevatorSpeed * deltaTime

    updateSegments(deltaTime)

    gameStore.updateStats(deltaTime)
    gameStore.updateDifficulty()

    if (gameStore.currentEvent) {
        const event = gameStore.currentEvent as any
        if (event.update && event.update(deltaTime)) {
            gameStore.deactivateEvent()
        }
    } else {
        const newEvent = eventManager.update(deltaTime, gameStore.stats.timeAlive)
        if (newEvent) {
            gameStore.activateEvent(newEvent)
        }
    }

    checkCollisions()
}

const handleInput = () => {
    if (keysPressed.has('ArrowLeft')) {
        physics.moveLeft(gameStore.player)
    }
    if (keysPressed.has('ArrowRight')) {
        physics.moveRight(gameStore.player)
    }
    if (keysPressed.has('ArrowDown')) {
        physics.crouch(gameStore.player, true)
    }
    if (keysPressed.has('Shift') && keysPressed.has('ArrowLeft')) {
        physics.dash(gameStore.player, -1)
    }
    if (keysPressed.has('Shift') && keysPressed.has('ArrowRight')) {
        physics.dash(gameStore.player, 1)
    }
}

const updateSegments = (deltaTime: number) => {
    gameStore.shaftSegments.forEach(segment => {
        segment.obstacles.forEach(obstacle => {
            obstacle.update(deltaTime)
        })
    })

    const topSegment = gameStore.shaftSegments[0]
    if (!topSegment || topSegment.position.y > gameStore.cameraOffset - 600) {
        const newY = topSegment ? topSegment.position.y - 600 : gameStore.cameraOffset - 600
        const newSegment = segmentPool.get(newY, gameStore.difficulty.obstacleFrequency)
        gameStore.shaftSegments.unshift(newSegment)
    }

    while (gameStore.shaftSegments.length > 0) {
        const lastSegment = gameStore.shaftSegments[gameStore.shaftSegments.length - 1]!
        if (lastSegment.position.y > gameStore.cameraOffset + 800) {
            segmentPool.release(gameStore.shaftSegments.pop()!)
        } else {
            break
        }
    }
}

const checkCollisions = () => {
    gameStore.shaftSegments.forEach(segment => {
        segment.obstacles.forEach(obstacle => {
            if (collision.checkPlayerObstacleCollision(gameStore.player, obstacle)) {
                if (!damageTimeout) {
                    gameStore.damagePlayer(obstacle.damage)
                    damageTimeout = window.setTimeout(() => {
                        damageTimeout = null
                    }, 500)
                }
            }

            const nearMissKey = `${segment.id}-${obstacle.id}`
            if (!nearMissTracked.has(nearMissKey) && collision.checkNearMiss(gameStore.player, obstacle)) {
                gameStore.addNearMiss()
                nearMissTracked.add(nearMissKey)
            }
        })
    })
}

const render = () => {
    if (!ctx) return

    const canvas = ctx.canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(0, -gameStore.cameraOffset)

    drawElevatorShaft()

    gameStore.shaftSegments.forEach(segment => {
        drawSegment(segment)
    })

    drawPlayer(ctx, gameStore.player)

    ctx.restore()

    if (gameStore.currentEvent?.type === EventType.MONSTER_ENCOUNTER) {
        drawMonster(ctx, gameStore.currentEvent)
    }
}

const drawElevatorShaft = () => {
    if (!ctx) return

    const canvas = ctx.canvas
    const startY = Math.floor(gameStore.cameraOffset / 100) * 100

    ctx.fillStyle = '#0f1729'
    ctx.fillRect(0, startY - 1000, canvas.width, 3000)

    ctx.fillStyle = '#1a0a2e'
    ctx.fillRect(0, startY - 1000, 50, 3000)
    ctx.fillRect(canvas.width - 50, startY - 1000, 50, 3000)

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let y = startY - 1000; y < startY + 2000; y += 50) {
        ctx.beginPath()
        ctx.moveTo(50, y)
        ctx.lineTo(canvas.width - 50, y)
        ctx.stroke()
    }
}

const drawSegment = (segment: any) => {
    if (!ctx) return

    const c = ctx

    segment.obstacles.forEach((obstacle: any) => {
        if (!obstacle.active && obstacle.type !== 'TIMED') return

        c.save()

        let color = '#00ffff'
        if (obstacle.variant === 'cable') color = '#ff00ff'
        else if (obstacle.variant === 'panel') color = '#9d00ff'
        else if (obstacle.variant === 'piston') color = '#ff0080'
        else if (obstacle.variant === 'spike') color = '#ff0000'
        else if (obstacle.variant === 'laser') color = '#00ff41'

        c.fillStyle = obstacle.active ? color : `${color}40`
        c.shadowColor = color
        c.shadowBlur = obstacle.active ? 15 : 5

        c.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.size.width,
            obstacle.size.height
        )

        if (obstacle.type === 'TIMED' && !obstacle.active) {
            c.strokeStyle = color
            c.lineWidth = 2
            c.strokeRect(
                obstacle.position.x - 2,
                obstacle.position.y - 2,
                obstacle.size.width + 4,
                obstacle.size.height + 4
            )
        }

        c.restore()
    })
}

onMounted(() => {
    if (canvasRef.value) {
        ctx = canvasRef.value.getContext('2d')
        if (ctx) {
            const isMobile = window.innerWidth < 768
            if (isMobile) {
                canvasRef.value.width = window.innerWidth
                canvasRef.value.height = window.innerHeight
            } else {
                canvasRef.value.width = 450
                canvasRef.value.height = 600
            }
        }
    }

    gameStore.shaftSegments = generator.generateInitialSegments(5)

    setTimeout(() => {
        showHints.value = false
        showTouchZones.value = false
    }, 1500)

    lastTime = performance.now()
    animationFrameId = requestAnimationFrame(gameLoop)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    if (canvasRef.value) {
        canvasRef.value.addEventListener('touchstart', handleTouchStart, { passive: false })
        canvasRef.value.addEventListener('touchmove', handleTouchMove, { passive: false })
        canvasRef.value.addEventListener('touchend', handleTouchEnd, { passive: false })
    }
})

onUnmounted(() => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)

    if (canvasRef.value) {
        canvasRef.value.removeEventListener('touchstart', handleTouchStart)
        canvasRef.value.removeEventListener('touchmove', handleTouchMove)
        canvasRef.value.removeEventListener('touchend', handleTouchEnd)
    }
})
</script>

<style scoped>
.filter-dark {
    filter: brightness(0.3) contrast(1.2);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes glow-pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

.animate-glow-pulse {
    animation: glow-pulse 2s ease-in-out infinite;
}

@media (max-width: 768px) {
    canvas {
        touch-action: none;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
    }
}
</style>