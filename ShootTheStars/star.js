import { checkBounds } from '../Support/bounds.js'
import { randomElmFromArray } from '../Support/random.js'

export class Star {
    constructor(upgradeManager, onDeath, options = {}) {
        this.data = upgradeManager.getData('stars')
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        const sizeDiff = this.data.maxSize - this.data.minSize
        this.size = this.data.minSize + Math.random() * sizeDiff
        this.type = options.type ?? 'star'
        this.itemKey = this.type === 'paint' ? 'paint' : 'starFragments'
        this.paintSprite = options.paintSprite
        this.paintIndex = options.paintIndex ?? 0
        // collectionRadius defines the hit area for collecting stars (visual size + buffer)
        this.collectionRadius = this.size + 8;
        this.color = options.color ?? randomElmFromArray(this.data.color)
        this.rot = Math.random() * Math.PI * 2
        const speedDiff = this.data.maxSpeed - this.data.minSpeed
        this.speed = this.data.minSpeed + Math.random() * speedDiff
        this.onDeath = onDeath
    }
    update() {
        const cos = Math.cos(this.rot)
        const sin = Math.sin(this.rot)
        this.x += cos * this.speed
        this.y += sin * this.speed
    }
    draw(ctx) {
        if (this.type === 'paint') {
            const spriteSize = 16
            const drawSize = Math.max(10, this.size * 7)
            const sx = this.paintIndex * spriteSize
            ctx.save()
            ctx.imageSmoothingEnabled = false
            ctx.drawImage(this.paintSprite, sx, 0, spriteSize, spriteSize, this.x - drawSize / 2, this.y - drawSize / 2, drawSize, drawSize)
            ctx.restore()
            return
        }
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}