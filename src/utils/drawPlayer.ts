import type { Player } from '@/types/game'


export const drawPlayer = (ctx : CanvasRenderingContext2D, player: Player) => {
    if (!ctx) return

    ctx.save()

    // Responsive scaling based on screen size
    const isMobile = window.innerWidth < 768
    const isSmallMobile = window.innerWidth < 480
    
    // Adjust player scale for different screen sizes
    const basePlayerScale = isSmallMobile ? 0.7 : isMobile ? 0.75 : 0.85
    const playerScale = basePlayerScale

    const rawX = player.position.x
    const rawY = player.position.y
    const rawWidth = player.size.width
    const rawHeight = player.size.height

    const width = rawWidth * playerScale
    const height = rawHeight * playerScale

    const x = rawX + (rawWidth - width) / 2
    const y = rawY + (rawHeight - height) / 2

    const centerX = x + width / 2
    const centerY = y + height / 2

    // Scale details and effects based on screen size
    const detailScale = isSmallMobile ? 0.65 : isMobile ? 0.75 : 1
    const shadowScale = isSmallMobile ? 0.3 : isMobile ? 0.4 : 0.5

    // Body gradient
    const bodyGradient = ctx.createLinearGradient(x, y, x, y + height)
    bodyGradient.addColorStop(0, '#00ffff')
    bodyGradient.addColorStop(0.5, '#0099ff')
    bodyGradient.addColorStop(1, '#0055ff')


    ctx.shadowColor = '#00ffff'
    ctx.shadowBlur = isMobile ? 10 * shadowScale : 15 * shadowScale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const radius = 8 * detailScale * playerScale

    // Main body
    ctx.fillStyle = bodyGradient
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.fill() 

    // Window/visor
    ctx.fillStyle = '#002266'
    ctx.beginPath()
    ctx.roundRect(
        x + width * 0.1,
        y + height * 0.15,
        width * 0.8,
        height * 0.2,
        radius * 0.5
    )
    ctx.fill()

    // Window outline
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = isMobile ? 1 * detailScale : 1.2 * detailScale
    ctx.shadowColor = '#00ffff'
    ctx.shadowBlur = isMobile ? 5 * shadowScale : 8 * shadowScale
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'

    const eyeSize = isSmallMobile ? 3.5 * detailScale * playerScale : 4 * detailScale * playerScale

    const drawEye = (ex: number) => {
        if (!ctx) return
        const glow = ctx.createRadialGradient(
            ex, y + height * 0.3, 0,
            ex, y + height * 0.3, eyeSize * 2
        )
        glow.addColorStop(0, '#ffffff')
        glow.addColorStop(0.6, '#00ffff')
        glow.addColorStop(1, 'transparent')

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(ex, y + height * 0.3, eyeSize, 0, Math.PI * 2)
        ctx.fill()
    }

    drawEye(centerX - width * 0.2)
    drawEye(centerX + width * 0.2)

    // Core/power indicator 
    const pulse = (Date.now() % 2000) / 2000
    const pulseFactor = 0.5 + Math.sin(pulse * Math.PI * 2) * 0.5
    const pulseIntensity = isMobile ? 1.5 : 2
    const coreSize = 6 * detailScale * playerScale + pulseFactor * pulseIntensity

    const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreSize * 1.5
    )
    coreGradient.addColorStop(0, '#ffffff')
    coreGradient.addColorStop(0.7, '#00ffea')
    coreGradient.addColorStop(1, 'transparent')

    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
    ctx.fill()

    // Core outline
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.arc(centerX, centerY, coreSize + 2, 0, Math.PI * 2)
    ctx.stroke()

    // Detail lines 
    if (!isMobile) {
        ctx.strokeStyle = '#00a8ff'
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(x + width * 0.3, y + height * 0.2)
        ctx.lineTo(x + width * 0.7, y + height * 0.2)
        ctx.moveTo(x + width * 0.3, y + height * 0.7)
        ctx.lineTo(x + width * 0.7, y + height * 0.7)
        ctx.stroke()
    }

    // Side indicators 
    const indicatorWidth = isSmallMobile ? 3 * detailScale : 4 * detailScale
    const indicatorHeight = isSmallMobile ? 1.2 * detailScale : 1.5 * detailScale
    
    ctx.fillStyle = '#0088ff'
    ctx.fillRect(x + width * 0.1, y + height * 0.75, indicatorWidth, indicatorHeight)
    ctx.fillRect(
        x + width * 0.9 - indicatorWidth,
        y + height * 0.75,
        indicatorWidth,
        indicatorHeight
    )

    
    const statusLightSize = isSmallMobile ? 1.5 * detailScale : 2 * detailScale
    
    ctx.shadowBlur = isMobile ? 3 * shadowScale : 5 * shadowScale
    ctx.shadowColor = '#00ff88'
    ctx.fillStyle = '#00ff88'
    ctx.beginPath()
    ctx.arc(centerX, y - 5, statusLightSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
}