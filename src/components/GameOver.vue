<template>
    <div class="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div
            class="bg-gradient-to-br from-cyber-purple to-cyber-blue p-6 sm:p-8 md:p-12 border-2 sm:border-4 border-red-500 max-w-2xl w-full shadow-red animate-slide-up">
            <div class="text-center mb-6 sm:mb-8">
                <h2
                    class="font-display text-4xl sm:text-5xl md:text-6xl text-red-500 font-bold mb-3 sm:mb-4 tracking-wider animate-flicker">
                    GAME OVER
                </h2>
                <p class="font-body text-base sm:text-lg md:text-xl text-white/70">
                    The elevator has malfunctioned...
                </p>
            </div>

            <!-- Final Stats -->
            <div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
                <div class="stat-card">
                    <div class="stat-icon text-neon-cyan">📊</div>
                    <div class="stat-label">Final Score</div>
                    <div class="stat-value text-neon-cyan">{{ gameStore.stats.score }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon text-neon-pink">🏢</div>
                    <div class="stat-label">Floors Reached</div>
                    <div class="stat-value text-neon-pink">{{ gameStore.stats.floors }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon text-neon-yellow">⏱️</div>
                    <div class="stat-label">Time Survived</div>
                    <div class="stat-value text-neon-yellow">{{ formattedTime }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon text-neon-green">⚡</div>
                    <div class="stat-label">Near Misses</div>
                    <div class="stat-value text-neon-green">{{ gameStore.stats.nearMisses }}</div>
                </div>
            </div>

            <!-- High Score Badge -->
            <div v-if="isNewHighScore"
                class="mb-6 sm:mb-8 p-4 sm:p-6 border-2 sm:border-4 border-neon-yellow bg-neon-yellow/10 animate-glow-pulse">
                <div class="text-center">
                    <div class="text-3xl sm:text-4xl md:text-5xl mb-2">🏆</div>
                    <div class="font-display text-xl sm:text-2xl md:text-3xl text-neon-yellow font-bold tracking-wider">
                        NEW HIGH SCORE!
                    </div>
                </div>
            </div>

            <div v-else class="mb-6 sm:mb-8 p-3 sm:p-4 border-2 border-neon-cyan/30 bg-cyber-darker/50">
                <div class="flex justify-between items-center">
                    <span class="font-body text-sm sm:text-base text-white/70">High Score</span>
                    <span class="font-display text-xl sm:text-2xl text-neon-cyan font-bold">{{ gameStore.stats.highScore
                        }}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2 sm:space-y-3">
                <button @click="retry"
                    class="w-full neon-button neon-button-cyan font-display text-lg sm:text-xl md:text-2xl tracking-widest py-3 sm:py-4">
                    TRY AGAIN
                </button>
                <button @click="quit"
                    class="w-full neon-button neon-button-pink font-display text-base sm:text-lg md:text-xl tracking-widest py-3 sm:py-4">
                    MAIN MENU
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()

const formattedTime = computed(() => {
    const seconds = Math.floor(gameStore.stats.timeAlive)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
})

const isNewHighScore = computed(() => {
    return gameStore.stats.score === gameStore.stats.highScore && gameStore.stats.score > 0
})

const retry = () => {
    gameStore.startGame()
}

const quit = () => {
    gameStore.resetGame()
    router.push('/')
}
</script>

<style scoped>
.shadow-red {
    box-shadow: 0 0 40px rgba(255, 0, 0, 0.4);
}

@media (min-width: 640px) {
    .shadow-red {
        box-shadow: 0 0 60px rgba(255, 0, 0, 0.6);
    }
}

.stat-card {
    @apply p-3 sm:p-4 md:p-6 border-2 border-current bg-cyber-darker/50 flex flex-col items-center justify-center border-opacity-30;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

@media (min-width: 640px) {
    .stat-card {
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    }
}

.stat-icon {
    @apply text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2;
}

.stat-label {
    @apply font-body text-xs sm:text-sm text-white/70 tracking-wider mb-1 sm:mb-2;
}

.stat-value {
    @apply font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-wider;
    text-shadow: 0 0 10px currentColor;
}

@media (min-width: 640px) {
    .stat-value {
        text-shadow: 0 0 15px currentColor;
    }
}

.neon-button {
    @apply px-4 sm:px-6 md:px-8 border-2 font-bold transition-all duration-300;
    @apply hover:scale-105 active:scale-95;
}

.neon-button-cyan {
    @apply border-neon-cyan text-neon-cyan bg-cyber-darker/50;
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.neon-button-cyan:hover {
    @apply bg-neon-cyan/10;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.2);
}

.neon-button-pink {
    @apply border-neon-pink text-neon-pink bg-cyber-darker/50;
    box-shadow: 0 0 10px rgba(255, 0, 255, 0.3), inset 0 0 10px rgba(255, 0, 255, 0.1);
}

.neon-button-pink:hover {
    @apply bg-neon-pink/10;
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.6), inset 0 0 20px rgba(255, 0, 255, 0.2);
}

/* Ensure touch targets are large enough on mobile */
@media (max-width: 639px) {
    .neon-button {
        min-height: 48px;
    }
}
</style>