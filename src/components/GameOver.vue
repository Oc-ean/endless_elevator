<template>
    <div class="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 
            p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
        <div class="bg-gradient-to-br from-cyber-purple to-cyber-blue border-2 sm:border-4 border-red-500 w-full 
            max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-lg
            shadow-red animate-slide-up 
            p-4 sm:p-6 md:p-8 lg:p-10
            lg:h-[570px] xl:h-[700px] lg:overflow-y-auto">

            <!-- Header -->
            <div class="text-center mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <h2
                    class="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-red-500 font-bold mb-2 sm:mb-3 tracking-wider animate-flicker leading-none">
                    GAME OVER
                </h2>
                <p class="font-body text-sm sm:text-base md:text-lg lg:text-xl text-white/70">
                    The elevator has malfunctioned...
                </p>
            </div>

            <!-- Final Stats -->
            <div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-3 lg:gap-4 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
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
                class="mb-4 sm:mb-5 md:mb-6 lg:mb-8 p-3 sm:p-4 md:p-5 lg:p-6 border-2 sm:border-4 border-neon-yellow bg-neon-yellow/10 animate-glow-pulse">
                <div class="text-center">
                    <div class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1 sm:mb-2">🏆</div>
                    <div
                        class="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-neon-yellow font-bold tracking-wider">
                        NEW HIGH SCORE!
                    </div>
                </div>
            </div>

            <div v-else
                class="mb-4 sm:mb-5 md:mb-6 lg:mb-8 p-2.5 sm:p-3 md:p-3.5 lg:p-4 border-2 border-neon-cyan/30 bg-cyber-darker/50">
                <div class="flex justify-between items-center">
                    <span class="font-body text-xs sm:text-sm md:text-sm lg:text-base text-white/70">High Score</span>
                    <span class="font-display text-lg sm:text-xl md:text-xl lg:text-2xl text-neon-cyan font-bold">
                        {{ gameStore.stats.highScore }}
                    </span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2 sm:space-y-2.5 md:space-y-3">
                <button @click="retry"
                    class="w-full neon-button neon-button-cyan font-display text-base sm:text-lg md:text-xl lg:text-2xl tracking-widest py-3 sm:py-3.5 md:py-4">
                    TRY AGAIN
                </button>
                <button @click="quit"
                    class="w-full neon-button neon-button-pink font-display text-sm sm:text-base md:text-lg lg:text-xl tracking-widest py-2.5 sm:py-3 md:py-3.5 lg:py-4">
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
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.4);
}

@media (min-width: 640px) {
    .shadow-red {
        box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
    }
}

@media (min-width: 1024px) {
    .shadow-red {
        box-shadow: 0 0 60px rgba(255, 0, 0, 0.6);
    }
}

.stat-card {
    @apply p-2 sm:p-3 md:p-4 lg:p-6 border-2 border-current bg-cyber-darker/50 flex flex-col items-center justify-center;
    border-opacity: 0.3;
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.15);
}

@media (min-width: 1024px) {
    .stat-card {
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    }
}

.stat-icon {
    @apply text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2;
}

.stat-label {
    @apply font-body text-[10px] sm:text-xs md:text-xs lg:text-sm text-white/70 tracking-wider mb-1 sm:mb-2 text-center;
}

.stat-value {
    @apply font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-wider;
    text-shadow: 0 0 8px currentColor;
}

@media (min-width: 1024px) {
    .stat-value {
        text-shadow: 0 0 15px currentColor;
    }
}

.neon-button {
    @apply px-4 sm:px-5 md:px-6 lg:px-8 border-2 font-bold transition-all duration-300 min-h-[44px] sm:min-h-[48px] lg:min-h-[56px];
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
</style>