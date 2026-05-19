import { resizeCanvas } from "../main.js";

resizeCanvas('stsCanvas')
class ShootTheStars {
    constructor(canvasId) {
        const canvas = document.getElementById(canvasId)
        this.ctx = canvas.getContext('2d')
        this.refreshRate = 1000 / 60 // 60 fps
        this.accumulatedTime = 0
        this.lastTime = performance.now()
    }
    loop() {
        // throttle so fps is consistent
        const currentTime = performance.now()
        const deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime
        this.accumulatedTime += deltaTime
        while (this.accumulatedTime >= this.refreshRate) {
            this.accumulatedTime -= this.refreshRate
            this.update()
        }
        // close the loop
        window.requestAnimationFrame(this.loop.bind(this))
    }
    update(){

    }
    draw(){
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

    }
}