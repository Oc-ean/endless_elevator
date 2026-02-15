<template>
  <div class="absolute inset-0 pointer-events-none">
    <!-- Top HUD -->
    <div class="absolute top-0 left-0 right-0 p-3 md:p-6 flex justify-between items-start gap-2">
      <!-- Score and Floor -->
      <div class="space-y-2">
        <div class="hud-panel">
          <span class="hud-label">SCORE</span>
          <span class="hud-value text-neon-cyan text-lg md:text-2xl">{{ gameStore.stats.score }}</span>
        </div>
        <div class="hud-panel">
          <span class="hud-label">FLOOR</span>
          <span class="hud-value text-neon-pink text-lg md:text-2xl">{{ gameStore.stats.floors }}</span>
        </div>
        <button
          class="md:hidden hud-panel pointer-events-auto flex items-center justify-center gap-2 hover:border-neon-pink/70 transition-colors active:scale-95"
          @click="gameStore.pauseGame()">
          <span class="text-xl">⏸️</span>
          <span class="hud-label">PAUSE</span>
        </button>
      </div>

      <!-- Health Bar and Speed -->
      <div class="flex flex-col gap-2">
        <div class="hud-panel w-40 md:w-64">
          <span class="hud-label mb-1 md:mb-2 block">HEALTH</span>
          <div class="h-4 md:h-6 bg-cyber-darker border-2 border-neon-cyan/30 relative overflow-hidden">
            <div class="absolute inset-0 transition-all duration-300" :class="healthBarColor"
              :style="{ width: `${healthPercentage}%` }">
              <div class="absolute inset-0 opacity-50 animate-pulse"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-white font-display text-xs md:text-sm tracking-wider">
                {{ gameStore.player.health }} / {{ gameStore.player.maxHealth }}
              </span>
            </div>
          </div>
        </div>

        <!-- Mobile Speed Indicator -->
        <div class="sm:hidden hud-panel w-40">
          <span class="hud-label mb-1 block">SPEED</span>
          <div class="flex items-center gap-2">
            <div class="relative flex-1 h-3 border-2 border-neon-cyan/30 bg-cyber-darker overflow-hidden">
              <div
                class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-yellow transition-all duration-300"
                :style="{ width: `${speedPercentage}%` }">
                <div class="absolute inset-0 opacity-50 animate-pulse"></div>
              </div>
            </div>
            <span class="hud-value text-neon-cyan text-sm font-bold min-w-[2rem] text-right">{{
              Math.floor(gameStore.elevatorSpeed) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Speed indicator (Side) -->
    <div class="hidden sm:block absolute top-1/2 right-3 md:right-6 -translate-y-1/2">
      <div class="hud-panel flex flex-col items-center">
        <span class="hud-label mb-1 md:mb-2">SPEED</span>
        <div class="relative w-12 md:w-16 h-32 md:h-48 border-2 border-neon-cyan/30 bg-cyber-darker overflow-hidden">
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neon-cyan to-neon-pink transition-all duration-300"
            :style="{ height: `${speedPercentage}%` }">
            <div class="absolute inset-0 opacity-50 animate-pulse"></div>
          </div>
        </div>
        <span class="hud-value text-neon-cyan mt-1 md:mt-2 text-lg md:text-2xl">{{ Math.floor(gameStore.elevatorSpeed)
        }}</span>
      </div>
    </div>

    <!-- Bottom section -->
    <div class="absolute bottom-3 md:bottom-6 left-0 right-0 px-3 md:px-6">
      <div class="flex justify-between items-end">
        <!-- Time alive - Left side -->
        <div class="hud-panel">
          <span class="hud-label">TIME</span>
          <span class="hud-value text-neon-yellow text-lg md:text-2xl">{{ formattedTime }}</span>
        </div>

        <div class="flex gap-2 md:flex-col md:space-y-2">
          <div class="hud-panel-small">
            <span class="text-xs text-neon-cyan/70">MISSES</span>
            <span class="text-base md:text-lg text-neon-cyan font-bold">{{ gameStore.stats.nearMisses }}</span>
          </div>
          <div class="hud-panel-small">
            <span class="text-xs text-neon-pink/70">PERFECT</span>
            <span class="text-base md:text-lg text-neon-pink font-bold">{{ gameStore.stats.perfectSegments }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import PauseMenu from './PauseMenu.vue'

const gameStore = useGameStore()

const healthPercentage = computed(() => {
  return (gameStore.player.health / gameStore.player.maxHealth) * 100
})

const healthBarColor = computed(() => {
  const percent = healthPercentage.value
  if (percent > 60) return 'bg-neon-cyan'
  if (percent > 30) return 'bg-neon-yellow'
  return 'bg-red-500 animate-flicker'
})

const speedPercentage = computed(() => {
  return Math.min((gameStore.elevatorSpeed / 300) * 100, 100)
})

const formattedTime = computed(() => {
  const seconds = Math.floor(gameStore.stats.timeAlive)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const pauseGame = () => {
  if (gameStore.isPlaying) {
    gameStore.pauseGame()
  }
}
</script>

<style scoped>
.hud-panel {
  @apply bg-cyber-darker/80 backdrop-blur-sm border-2 border-neon-cyan/50 p-2 md:p-4;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2), inset 0 0 20px rgba(0, 255, 255, 0.1);
}

.hud-panel-small {
  @apply bg-cyber-darker/80 backdrop-blur-sm border border-neon-cyan/30 px-2 md:px-3 py-1 md:py-2 flex flex-col items-center;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.hud-label {
  @apply font-display text-xs tracking-widest text-neon-cyan/70;
}

.hud-value {
  @apply font-display font-bold tracking-wider;
  text-shadow: 0 0 10px currentColor;
}

@keyframes flicker {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

.animate-flicker {
  animation: flicker 0.3s ease-in-out infinite;
}

@media (max-width: 640px) {
  .hud-panel {
    @apply text-sm;
  }

  .hud-label {
    @apply text-[10px];
  }
}
</style>