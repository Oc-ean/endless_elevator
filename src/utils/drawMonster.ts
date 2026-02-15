


export const drawMonster = ( ctx : CanvasRenderingContext2D, currentEvent: any) => {
    if (!ctx) return

    const event = currentEvent
    if (!event.monsterPosition) return

    ctx.save()

    const isDesktop = window.innerWidth >= 1024
    const monsterScale = isDesktop ? 0.8 : 1

    const baseSize = 30
    const radius = baseSize * monsterScale

    const x = event.monsterPosition.x
    const y = event.monsterPosition.y

    const centerX = x + baseSize
    const centerY = y + baseSize

    // Monster body
    ctx.fillStyle = '#ff0000'
    ctx.shadowColor = '#ff0000'
    ctx.shadowBlur = 15

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // Reset shadow for details
    ctx.shadowBlur = 0

    // Eyes 
    const eyeOffsetX = 10 * monsterScale
    const eyeOffsetY = 5 * monsterScale
    const eyeSize = 5 * monsterScale

    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, eyeSize, 0, Math.PI * 2)
    ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, eyeSize, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
}