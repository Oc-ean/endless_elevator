
export const drawSegment = ( ctx: CanvasRenderingContext2D,segment: any) => {
    if (!ctx) return

    const c = ctx

    segment.obstacles.forEach((obstacle: any) => {
        if (!obstacle.active && obstacle.type !== 'TIMED') return

        c.save()

        // Different colors based on obstacle type
        let color = '#00ffff'
        if (obstacle.variant === 'cable') color = '#ff00ff'
        else if (obstacle.variant === 'panel') color = '#9d00ff'
        else if (obstacle.variant === 'piston') color = '#ff0080'
        else if (obstacle.variant === 'spike') color = '#ff0000'
        else if (obstacle.variant === 'laser') color = '#00ff41'

        // Draw obstacle
        c.fillStyle = obstacle.active ? color : `${color}40`
        c.shadowColor = color
        c.shadowBlur = obstacle.active ? 15 : 5

        c.fillRect(
            obstacle.position.x,
            obstacle.position.y,
            obstacle.size.width,
            obstacle.size.height
        )

        // Draw warning indicator for timed obstacles
        if (obstacle.type === 'TIMED' && !obstacle.active) {
            c.strokeStyle = color
            c.lineWidth = 2
            c.strokeRect(
                obstacle.position.x - 2,
                obstacle.position.y - 2,
                obstacle.size.width + 4,
                obstacle.size.height + 4
            )
        }

        c.restore()
    })
}