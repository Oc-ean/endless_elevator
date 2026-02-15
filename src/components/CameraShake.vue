<template>
    <div ref="cameraElement" class="absolute inset-0 pointer-events-none z-40" :style="{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px) rotate(${shakeOffset.rotation}deg)`,
        transition: `transform ${shakeDuration}ms ease-out`
    }">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface ShakeConfig {
    intensity: number;
    duration: number;
}

const cameraElement = ref<HTMLElement>();
const shakeOffset = ref({ x: 0, y: 0, rotation: 0 });
const shakeDuration = ref(0);
const isShaking = ref(false);

const startShake = (config: ShakeConfig) => {
    if (isShaking.value) return;

    isShaking.value = true;
    shakeDuration.value = config.duration;

    const maxIntensity = config.intensity * 10;
    const maxRotation = config.intensity * 2;

    const shakeLoop = () => {
        if (!isShaking.value) return;

        shakeOffset.value = {
            x: (Math.random() - 0.5) * maxIntensity,
            y: (Math.random() - 0.5) * maxIntensity,
            rotation: (Math.random() - 0.5) * maxRotation
        };

        requestAnimationFrame(shakeLoop);
    };

    shakeLoop();

    setTimeout(() => {
        isShaking.value = false;
        shakeOffset.value = { x: 0, y: 0, rotation: 0 };
        shakeDuration.value = 300;
    }, config.duration);
};

const handleCameraShake = (event: CustomEvent<ShakeConfig>) => {
    startShake(event.detail);
};

onMounted(() => {
    window.addEventListener('camera-shake', handleCameraShake as EventListener);

    // Test shake on mount (remove in production)
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('camera-shake', {
            detail: { intensity: 0.5, duration: 500 }
        }));
    }, 1000);
});

onUnmounted(() => {
    window.removeEventListener('camera-shake', handleCameraShake as EventListener);
});
</script>

<style scoped>
/* Add some performance optimizations */
:deep(*) {
    transform: translateZ(0);
    backface-visibility: hidden;
}
</style>