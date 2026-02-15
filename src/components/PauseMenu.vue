<template>
    <div class="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
        <div
            class="bg-gradient-to-br from-cyber-purple to-cyber-blue p-12 border-4 border-neon-cyan max-w-md w-full shadow-neon-cyan">
            <h2 class="font-display text-5xl text-neon-cyan font-bold text-center mb-8 tracking-wider">
                PAUSED
            </h2>

            <div class="space-y-4 mb-8">
                <div class="stat-row">
                    <span class="stat-label">Score</span>
                    <span class="stat-value text-neon-cyan">{{ gameStore.stats.score }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Floor</span>
                    <span class="stat-value text-neon-pink">{{ gameStore.stats.floors }}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time</span>
                    <span class="stat-value text-neon-yellow">{{ formattedTime }}</span>
                </div>
            </div>

            <div class="space-y-3">
                <button @click="resume"
                    class="w-full neon-button neon-button-cyan font-display text-xl tracking-widest">
                    RESUME
                </button>
                <button @click="restart"
                    class="w-full neon-button neon-button-pink font-display text-xl tracking-widest">
                    RESTART
                </button>
                <button @click="quit"
                    class="w-full neon-button neon-button-purple font-display text-xl tracking-widest">
                    QUIT TO MENU
                </button>
            </div>

            <div class="mt-6 p-4 border border-neon-cyan/30 bg-cyber-darker/50">
                <p class="font-body text-sm text-center text-neon-cyan/70">
                    Press ESC to resume
                </p>
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

const resume = () => {
    gameStore.resumeGame()
}

const restart = () => {
    gameStore.startGame()
}

const quit = () => {
    gameStore.resetGame()
    router.push('/')
}
</script>

<style scoped>
.shadow-neon-cyan {
    box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
}

.stat-row {
    @apply flex justify-between items-center p-3 border-l-4 border-neon-cyan bg-cyber-darker/30;
}

.stat-label {
    @apply font-body text-lg text-white/70 tracking-wider;
}

.stat-value {
    @apply font-display text-2xl font-bold tracking-wider;
    text-shadow: 0 0 10px currentColor;
}

.neon-button {
    @apply px-6 py-3 border-2 font-bold transition-all duration-300;
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

.neon-button-purple {
    @apply border-neon-purple text-neon-purple bg-cyber-darker/50;
    box-shadow: 0 0 10px rgba(157, 0, 255, 0.3), inset 0 0 10px rgba(157, 0, 255, 0.1);
}

.neon-button-purple:hover {
    @apply bg-neon-purple/10;
    box-shadow: 0 0 20px rgba(157, 0, 255, 0.6), inset 0 0 20px rgba(157, 0, 255, 0.2);
}
</style>