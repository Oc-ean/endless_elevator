<template>
    <div
        class="relative w-full min-h-screen bg-gradient-to-b from-cyber-darker via-cyber-purple to-cyber-blue overflow-hidden">

        <!-- Animated background grid -->
        <div class="absolute inset-0 opacity-20">
            <div class="grid-pattern"></div>
        </div>

        <!-- Glowing particles -->
        <div v-if="!isMobile" class="particles">
            <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle()"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 py-12 sm:py-16">

            <!-- Title -->
            <div class="text-center mb-6 sm:mb-10 lg:mb-12 animate-slide-up">
                <h1 class="font-display font-black mb-1 sm:mb-2 tracking-wider neon-text-cyan
                   text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                    ENDLESS
                </h1>
                <h2 class="font-display font-black neon-text-pink tracking-wider glitch
                   text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl" data-text="ELEVATOR">
                    ELEVATOR
                </h2>
                <p class="font-body mt-2 sm:mt-4 tracking-widest opacity-80 text-neon-cyan
                  text-xs sm:text-sm md:text-base lg:text-xl">
                    SURVIVE THE ASCENT
                </p>
            </div>

            <!-- Menu buttons -->
            <div
                class="flex flex-col gap-3 sm:gap-4 lg:gap-5 w-full max-w-[260px] sm:max-w-sm md:max-w-md lg:max-w-lg px-2 sm:px-4">

                <button @click="startGame" class="neon-button neon-button-cyan group relative overflow-hidden">
                    <span
                        class="relative z-10 font-display text-base sm:text-xl md:text-2xl lg:text-2xl tracking-widest">
                        START GAME
                    </span>
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-neon-cyan/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                </button>

                <button @click="showInstructions = true"
                    class="neon-button neon-button-pink group relative overflow-hidden">
                    <span
                        class="relative z-10 font-display text-base sm:text-xl md:text-2xl lg:text-2xl tracking-widest">
                        INSTRUCTIONS
                    </span>
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>

                <!-- High Score -->
                <div
                    class="text-center mt-2 sm:mt-4 lg:mt-6 p-3 sm:p-4 lg:p-6 border-2 border-neon-purple/50 bg-cyber-purple/20 backdrop-blur-sm">
                    <p
                        class="font-body text-[10px] sm:text-xs lg:text-sm text-neon-purple tracking-widest mb-1 sm:mb-2">
                        HIGH SCORE
                    </p>
                    <p class="font-display text-xl sm:text-3xl md:text-4xl lg:text-4xl text-neon-cyan font-bold">
                        {{ gameStore.stats.highScore }}
                    </p>
                </div>
            </div>

            <!-- Version -->
            <div class="absolute bottom-3 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2
                  font-body text-[10px] sm:text-xs lg:text-sm text-neon-cyan/50 tracking-widest whitespace-nowrap">
                v1.0.0 | CYBERPUNK EDITION
            </div>
        </div>

        <!-- Instructions Modal -->
        <transition name="fade">
            <div v-if="showInstructions"
                class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8"
                @click="showInstructions = false">
                <div class="bg-gradient-to-br from-cyber-purple to-cyber-blue border-2 border-neon-cyan shadow-neon-cyan relative
                 w-full max-w-xs sm:max-w-lg md:max-w-2xl
                 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto
                 p-4 sm:p-6 md:p-8" @click.stop>
                    <button @click="showInstructions = false"
                        class="absolute top-3 right-3 sm:top-4 sm:right-4 text-neon-pink hover:text-neon-cyan transition-colors text-xl sm:text-2xl">
                        ✕
                    </button>

                    <h3 class="font-display text-xl sm:text-2xl md:text-3xl text-neon-cyan mb-4 sm:mb-6 tracking-wider">
                        INSTRUCTIONS
                    </h3>

                    <div
                        class="font-body text-white/90 space-y-3 sm:space-y-4 text-xs sm:text-sm md:text-base lg:text-lg">

                        <div class="border-l-4 border-neon-cyan pl-3 sm:pl-4">
                            <p class="text-neon-cyan font-semibold mb-1 sm:mb-2">CONTROLS</p>
                            <ul class="space-y-1 sm:space-y-2 hidden sm:block">
                                <li>← → : Move</li>
                                <li>SPACE : Jump</li>
                                <li>↓ : Crouch</li>
                                <li>SHIFT + ← → : Dash</li>
                                <li>ESC : Pause</li>
                            </ul>
                            <ul class="space-y-1 sm:hidden">
                                <li>Swipe left or right to move</li>
                                <li>Tap to jump</li>
                            </ul>
                        </div>

                        <div class="border-l-4 border-neon-pink pl-3 sm:pl-4">
                            <p class="text-neon-pink font-semibold mb-1 sm:mb-2">OBJECTIVE</p>
                            <p>Survive as long as possible in the malfunctioning elevator. Avoid obstacles and random
                                events as you ascend indefinitely.</p>
                        </div>

                        <div class="border-l-4 border-neon-purple pl-3 sm:pl-4">
                            <p class="text-neon-purple font-semibold mb-1 sm:mb-2">SCORING</p>
                            <ul class="space-y-1">
                                <li>+10 per floor</li>
                                <li>+50 near miss</li>
                                <li>+100 perfect segment</li>
                            </ul>
                        </div>

                        <div class="border-l-4 border-neon-yellow pl-3 sm:pl-4">
                            <p class="text-neon-yellow font-semibold mb-1 sm:mb-2">RANDOM EVENTS</p>
                            <p>Power cuts, monsters, traps, and speed boosts will test your reflexes.</p>
                        </div>
                    </div>

                    <button @click="showInstructions = false"
                        class="mt-6 sm:mt-8 w-full neon-button neon-button-cyan font-display text-base sm:text-lg md:text-xl tracking-widest">
                        GOT IT
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const gameStore = useGameStore()
const showInstructions = ref(false)
const isMobile = window.innerWidth < 640

const startGame = () => {
    gameStore.startGame()
    router.push('/game')
}

const getParticleStyle = () => {
    const x = Math.random() * 100
    const y = Math.random() * 100
    const size = Math.random() * 4 + 2
    const duration = Math.random() * 3 + 2
    return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
    }
}
</script>

<style scoped>
.neon-text-cyan {
    color: #00ffff;
    text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
}

.neon-text-pink {
    color: #ff00ff;
    text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
}

.neon-button {
    @apply px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-2 font-bold transition-all duration-300 relative;
    @apply hover:scale-105 active:scale-95;
    min-height: 44px;
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

.shadow-neon-cyan {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.grid-pattern {
    background-image:
        linear-gradient(rgba(0, 255, 255, .1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 255, .1) 1px, transparent 1px);
    background-size: 50px 50px;
    width: 100%;
    height: 100%;
    animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
    to {
        transform: translateY(50px);
    }
}

.particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.particle {
    position: absolute;
    background: radial-gradient(circle, rgba(0, 255, 255, .8), transparent 70%);
    border-radius: 50%;
    animation: float-particle infinite ease-in-out;
}

@keyframes float-particle {
    50% {
        transform: translateY(-30px) scale(1.2);
        opacity: .8;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>