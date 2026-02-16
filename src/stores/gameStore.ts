import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  GameState,
  Player,
  ShaftSegment,
  GameStats,
  DifficultyConfig,
  IEvent,
  EventType,
} from '@/types/game'
import { GameState as GameStateEnum } from '@/types/game'

export const useGameStore = defineStore('game', () => {
  const gameState = ref<GameState>(GameStateEnum.MENU)
  const isPaused = ref(false)
  const currentEvent = ref<IEvent | null>(null)
  
  const player = ref<Player>({
    position: { x: 180, y: 400 },
    velocity: { x: 0, y: 0 },
    size: { width: 50, height: 70 },
    health: 100,
    maxHealth: 100,
    canJump: true,
    isDashing: false,
    isCrouching: false,
  })

  const stats = ref<GameStats>({
    score: 0,
    floors: 0,
    distance: 0,
    timeAlive: 0,
    nearMisses: 0,
    perfectSegments: 0,
    highScore: parseInt(localStorage.getItem('endless-elevator-highscore') || '0'),
  })

  const difficulty = ref<DifficultyConfig>({
    baseSpeed: 110,
    speedMultiplier: 1.0,
    obstacleFrequency: 1.0,
    eventFrequency: 0.5,
    reactionTime: 2.0,
  })

  const shaftSegments = ref<ShaftSegment[]>([])
  const elevatorSpeed = ref(110)
  const cameraOffset = ref(0)
  
  const segmentDamageTracker = ref<Map<string, boolean>>(new Map())
  const lastHealthCheck = ref(100)

  const currentFloor = computed(() => Math.floor(stats.value.distance / 150))
  const currentSpeed = computed(() => difficulty.value.baseSpeed * difficulty.value.speedMultiplier)
  const isPlaying = computed(() => gameState.value === GameStateEnum.PLAYING || gameState.value === GameStateEnum.EVENT_ACTIVE)

  function startGame() {
    resetGame()
    gameState.value = GameStateEnum.PLAYING
  }

  function pauseGame() {
    if (isPlaying.value) {
      isPaused.value = true
      gameState.value = GameStateEnum.PAUSED
    }
  }

  function resumeGame() {
    if (gameState.value === GameStateEnum.PAUSED) {
      isPaused.value = false
      gameState.value = GameStateEnum.PLAYING
    }
  }

  function endGame() {
    gameState.value = GameStateEnum.GAME_OVER
    if (stats.value.score > stats.value.highScore) {
      stats.value.highScore = stats.value.score
      localStorage.setItem('endless-elevator-highscore', stats.value.score.toString())
    }
  }

  function resetGame() {
    player.value = {
      position: { x: 180, y: 400 },
      velocity: { x: 0, y: 0 },
      size: { width: 50, height: 70 },
      health: 100,
      maxHealth: 100,
      canJump: true,
      isDashing: false,
      isCrouching: false,
    }
    
    stats.value = {
      ...stats.value,
      score: 0,
      floors: 0,
      distance: 0,
      timeAlive: 0,
      nearMisses: 0,
      perfectSegments: 0,
    }

    difficulty.value = {
      baseSpeed: 110,
      speedMultiplier: 1.0,
      obstacleFrequency: 1.0,
      eventFrequency: 0.5,
      reactionTime: 2.0,
    }

    shaftSegments.value = []
    elevatorSpeed.value = 110
    cameraOffset.value = 0
    currentEvent.value = null
    segmentDamageTracker.value.clear()
    lastHealthCheck.value = 100
  }

  function updateStats(deltaTime: number) {
    stats.value.timeAlive += deltaTime
    stats.value.distance += elevatorSpeed.value * deltaTime
    stats.value.floors = currentFloor.value
    stats.value.score = Math.floor(stats.value.distance / 10) + (stats.value.nearMisses * 50) + (stats.value.perfectSegments * 100)
  }

  function updateDifficulty() {
    const timeScale = Math.min(stats.value.timeAlive / 60, 3)
    difficulty.value.speedMultiplier = 1.0 + (timeScale * 0.6)
    difficulty.value.obstacleFrequency = 1.0 + (timeScale * 0.4)
    difficulty.value.eventFrequency = 0.5 + (timeScale * 0.3)
    difficulty.value.reactionTime = Math.max(0.8, 2.0 - (timeScale * 0.4)) 
    elevatorSpeed.value = currentSpeed.value
  }

  function damagePlayer(amount: number) {
    player.value.health = Math.max(0, player.value.health - amount)
    
    shaftSegments.value.forEach(segment => {
      if (!segment.passed) {
        segmentDamageTracker.value.set(segment.id, true)
      }
    })
    
    if (player.value.health <= 0) {
      endGame()
    }
  }

  function healPlayer(amount: number) {
    player.value.health = Math.min(player.value.maxHealth, player.value.health + amount)
  }

  function activateEvent(event: IEvent) {
    currentEvent.value = event
    gameState.value = GameStateEnum.EVENT_ACTIVE
    event.activate()
  }

  function deactivateEvent() {
    if (currentEvent.value) {
      currentEvent.value.deactivate()
      currentEvent.value = null
      gameState.value = GameStateEnum.PLAYING
    }
  }

  function addNearMiss() {
    stats.value.nearMisses++
  }

  function addPerfectSegment() {
    stats.value.perfectSegments++
  }
  
  function checkSegmentPerfection(segment: ShaftSegment) {
    if (segment.passed) return
    
    segment.passed = true
    
    const hadDamage = segmentDamageTracker.value.get(segment.id)
    
    if (!hadDamage && segment.obstacles.length > 0) {
      addPerfectSegment()
    }
    
    // Clean up old tracking data
    segmentDamageTracker.value.delete(segment.id)
  }

  return {
    gameState,
    isPaused,
    player,
    stats,
    difficulty,
    shaftSegments,
    elevatorSpeed,
    cameraOffset,
    currentEvent,
    
    
    currentFloor,
    currentSpeed,
    isPlaying,
    
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    updateStats,
    updateDifficulty,
    damagePlayer,
    healPlayer,
    activateEvent,
    deactivateEvent,
    addNearMiss,
    addPerfectSegment,
    checkSegmentPerfection,
  }
})