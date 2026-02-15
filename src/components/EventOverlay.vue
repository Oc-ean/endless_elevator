<template>
    <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
        <transition name="event-fade">
            <div v-if="event" class="event-banner" :class="eventClass">
                <div class="event-icon">{{ eventIcon }}</div>
                <div class="flex-1">
                    <h3 class="font-display text-2xl font-bold tracking-wider mb-1">{{ eventTitle }}</h3>
                    <p class="font-body text-sm opacity-80">{{ eventDescription }}</p>
                </div>
                <div class="event-timer">
                    <div class="text-3xl font-display font-bold">{{ remainingTime }}</div>
                    <div class="text-xs opacity-70">SECONDS</div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EventType, type IEvent } from '@/types/game'

const props = defineProps<{
    event: IEvent
}>()

const eventClass = computed(() => {
    switch (props.event.type) {
        case EventType.POWER_CUT:
            return 'event-powercut'
        case EventType.MONSTER_ENCOUNTER:
            return 'event-monster'
        case EventType.TRAP_MODE:
            return 'event-trap'
        case EventType.SPEED_BOOST:
            return 'event-speed'
        default:
            return ''
    }
})

const eventIcon = computed(() => {
    switch (props.event.type) {
        case EventType.POWER_CUT:
            return '⚡'
        case EventType.MONSTER_ENCOUNTER:
            return '👹'
        case EventType.TRAP_MODE:
            return '⚠️'
        case EventType.SPEED_BOOST:
            return '🚀'
        default:
            return '❓'
    }
})

const eventTitle = computed(() => {
    switch (props.event.type) {
        case EventType.POWER_CUT:
            return 'POWER CUT'
        case EventType.MONSTER_ENCOUNTER:
            return 'MONSTER DETECTED'
        case EventType.TRAP_MODE:
            return 'TRAP MODE ACTIVE'
        case EventType.SPEED_BOOST:
            return 'SPEED BOOST'
        default:
            return 'EVENT'
    }
})

const eventDescription = computed(() => {
    switch (props.event.type) {
        case EventType.POWER_CUT:
            return 'Limited visibility - Stay alert!'
        case EventType.MONSTER_ENCOUNTER:
            return 'Avoid the creature outside!'
        case EventType.TRAP_MODE:
            return 'Multiple hazards activated!'
        case EventType.SPEED_BOOST:
            return 'Elevator accelerating rapidly!'
        default:
            return 'Something is happening...'
    }
})

const remainingTime = computed(() => {
    const event = props.event as any
    if (event.elapsed !== undefined && event.duration) {
        return Math.ceil(event.duration - event.elapsed)
    }
    return props.event.duration
})
</script>

<style scoped>
.event-banner {
    @apply flex items-center gap-4 px-6 py-3 border-2 max-w-2xl mx-auto;
    @apply bg-cyber-darker/30 backdrop-blur-sm;
    animation: event-pulse 2s ease-in-out infinite;
}

.event-powercut {
    @apply border-yellow-400/50 text-yellow-400/90;
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.2), inset 0 0 15px rgba(255, 255, 0, 0.08);
}

.event-monster {
    @apply border-red-500/50 text-red-500/90;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.2), inset 0 0 15px rgba(255, 0, 0, 0.08);
}

.event-trap {
    @apply border-orange-500/50 text-orange-500/90;
    box-shadow: 0 0 15px rgba(255, 165, 0, 0.2), inset 0 0 15px rgba(255, 165, 0, 0.08);
}

.event-speed {
    @apply border-neon-cyan/50 text-neon-cyan/90;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.08);
}

.event-icon {
    @apply text-5xl animate-float;
}

.event-timer {
    @apply flex flex-col items-center justify-center px-4 py-3 border border-current border-opacity-20 bg-cyber-darker/30;
    min-width: 100px;
}

@keyframes event-pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }
}

.event-fade-enter-active,
.event-fade-leave-active {
    transition: all 0.5s ease;
}

.event-fade-enter-from {
    opacity: 0;
    transform: translateY(-50px) scale(0.8);
}

.event-fade-leave-to {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
}
</style>