import { resizeCanvas } from "../Support/canvasStuff.js";
import { settings } from "./settings.js";
import { loadSave, save } from "../Support/save.js"
import UpgradeManager from "./upgradeManager.js"
import StarManager from "./starManager.js"

function syncSaveSchema(target, source) {
    if (Array.isArray(source)) {
        if (!Array.isArray(target)) {
            return structuredClone(source)
        }

        // For arrays of upgrades, merge by id so new upgrades are injected while preserving levels.
        const sourceHasIds = source.every(entry => entry && typeof entry === 'object' && 'id' in entry)
        if (sourceHasIds) {
            const merged = source.map(defaultEntry => {
                const savedEntry = target.find(saved => saved && saved.id === defaultEntry.id)
                return syncSaveSchema(savedEntry, defaultEntry)
            })
            return merged
        }

        return structuredClone(source)
    }

    if (source && typeof source === 'object') {
        const out = (target && typeof target === 'object') ? target : {}
        for (const key of Object.keys(source)) {
            out[key] = syncSaveSchema(out[key], source[key])
        }
        return out
    }

    return target === undefined ? source : target
}

resizeCanvas('stsCanvas')
window.addEventListener('resize', () => resizeCanvas('stsCanvas'))
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => resizeCanvas('stsCanvas'))
    window.visualViewport.addEventListener('scroll', () => resizeCanvas('stsCanvas'))
}
class ShootTheStars {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId)
        this.ctx = canvas.getContext('2d')
        this.refreshRate = 1000 / 60 // 60 fps
        this.accumulatedTime = 0
        this.lastTime = performance.now()
        
        this.save = loadSave('save', settings.defaultSave)
        this.save = syncSaveSchema(this.save, settings.defaultSave)
        this.upgradeManager = new UpgradeManager(this.save)
        this.StarManager = new StarManager(this.upgradeManager)
        this.autosaveInterval = setInterval(() => {
            save('save', this.save)
        }, 10000)
    }
    loop() {
        // throttle so fps is consistent
        const currentTime = performance.now()
        const deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime
        this.accumulatedTime += deltaTime
        // cap accumulatedTime to avoid very l o n g frame
        if (this.accumulatedTime > 1000) {
            this.accumulatedTime = 1000
        }
        while (this.accumulatedTime >= this.refreshRate) {
            this.accumulatedTime -= this.refreshRate
            this.update()
            this.draw()
        }
        window.requestAnimationFrame(this.loop.bind(this))
    }
    update(){
        this.upgradeManager.update()
        this.StarManager.update()
    }
    draw(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.StarManager.draw(this.ctx)
    }
}
document.addEventListener('DOMContentLoaded', () => { const game = new ShootTheStars('stsCanvas'); game.loop(); })