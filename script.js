import globalizeSettings from "./ShootTheStars/data/settings.js"
globalizeSettings() // Make settings available globally

import ShootTheStars from "./ShootTheStars/ShootTheStars.js"
import Saver from "./Core/Saver.js"
import { Mouse, Keys } from "./Core/input.js"
import UpgradesManager from "./ShootTheStars/upgrades.js"


// Input instances (globalized in input.js as classes)

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d') 

/**
 * messy, but in this case just easier
 */
window.mouse = new Mouse(canvas)
window.keys = new Keys()
window.saver = new Saver({dbName: '100sidedice', saveId: 'default'})
window.upgrades = new UpgradesManager(window.saver)


function resizeCanvas() {
	const dpr = window.devicePixelRatio || 1
	// Set the CSS size to the viewport size
	canvas.style.width = window.innerWidth + 'px'
	canvas.style.height = window.innerHeight + 'px'
	// Set the drawing buffer size scaled by devicePixelRatio for sharpness
	canvas.width = Math.floor(window.innerWidth * dpr)
	canvas.height = Math.floor(window.innerHeight * dpr)
	// Scale drawing operations to use CSS pixels
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/* MainBoard UI controller: manages the info panel content and simple animations */
class MainBoard {
    constructor() {
        this.container = document.getElementById('mainBoard')
        if (!this.container) return
        this.panel = document.createElement('div')
        this.panel.className = 'panel'

        // close button
        this.closeBtn = document.createElement('button')
        this.closeBtn.className = 'mainboard-close'
        this.closeBtn.setAttribute('aria-label', 'Close')
        this.closeBtn.textContent = '×'
        this.closeBtn.addEventListener('click', ()=> this.clear())
        this.panel.appendChild(this.closeBtn)

        // content container
        this.content = document.createElement('div')
        this.content.className = 'content'
        this.panel.appendChild(this.content)

        this.container.appendChild(this.panel)
        this._visible = false
        this._opacity = 0
        this._fadeSpeed = 3.0 // opacity units per second
        // don't absorb pointer events until visible
        this.container.style.pointerEvents = 'none'
        this.panel.style.pointerEvents = 'none'
    }

    setText(html) {
        if (!this.panel) return
          this.content.innerHTML = html
        this.show()
    }

    clear() {
        if (!this.panel) return
          this.content.innerHTML = ''
        this.hide()
    }

    show() { this._visible = true; this._opacity = 1 }
    hide() { this._visible = false }

    update(dt) {
        if (!this.panel) return
        // simple fade out when not visible
        if (this._visible) {
            this._opacity = Math.min(1, this._opacity + dt * this._fadeSpeed)
        } else {
            this._opacity = Math.max(0, this._opacity - dt * this._fadeSpeed)
        }
        this.panel.style.opacity = String(this._opacity)
        this.panel.style.pointerEvents = this._opacity > 0.02 ? 'auto' : 'none'
        // ensure container doesn't absorb input when hidden
        if (this.container) this.container.style.pointerEvents = this._opacity > 0.02 ? 'auto' : 'none'
    }
}

// Shop UI is handled in ShootTheStars/shop.js (initShop, startItemsSync, renderItemsList)

/**
 * Main program class
 */
class Program {
    constructor() {
        this.game = new ShootTheStars(ctx)

        // Create the mainBoard UI controller
        this.mainBoard = new MainBoard()
        window.mainBoard = this.mainBoard

        this.autosaveInterval = 10000 // 10 seconds
        this.lastAutosave = performance.now()
        // Start autosave timer
        this.autosaveTimer = setInterval(() => {
            window.saver.save()
        }, this.autosaveInterval)
    }

    // Core loop: compute delta, handle input, delegate to game
    loop() {
        const now = performance.now()
        // compute delta time (seconds) and cap to 0.25s to avoid large jumps
        const rawDt = (now - (this.lastTime || now)) / 1000
        this.deltaTime = Math.min(rawDt, 0.25)
        this.lastTime = now

        if (window.keys) window.keys.update(this.deltaTime)
        if (window.mouse) window.mouse.update(this.deltaTime)
        // update main information panel
        if (this.mainBoard) this.mainBoard.update(this.deltaTime)

        this.game.update(this.deltaTime)

        

        this.game.draw()
        window.requestAnimationFrame(this.loop.bind(this))
    }
    static async preload() {
        // wait for saver and upgrades so game state reflects upgrades immediately
        await window.saver.ready
        if (window.upgrades._loadPromise) await window.upgrades._loadPromise

        
        ShootTheStars.preload() // initialize shop and start syncing items
        
        // create program and start loop
        const program = new Program()
        program.loop()

                // wire About button to open mainBoard with basic content
                const aboutEl = document.getElementById('about-link')
                if (aboutEl) {
                    aboutEl.addEventListener('click', (ev)=>{
                        ev.preventDefault && ev.preventDefault()
                        if (program.mainBoard) {
                            program.mainBoard.setText('<h2>About</h2><p>100sidedice — a tiny experimental project.</p><p>More info will go here.</p>')
                        }
                    })
                }

                // Add pressed state handling for left sidebar buttons so they clear on mouseup anywhere
                const onPointerDown = (ev) => {
                    const b = ev.target.closest && ev.target.closest('.linkbox')
                    if (b) {
                        b.classList.add('pressed')
                    }
                }
                const clearPressed = ()=>{
                    document.querySelectorAll && document.querySelectorAll('.linkbox.pressed').forEach(el=>el.classList.remove('pressed'))
                }
                document.addEventListener('mousedown', onPointerDown)
                document.addEventListener('touchstart', onPointerDown)
                document.addEventListener('mouseup', clearPressed)
                document.addEventListener('touchend', clearPressed)
        return program
    }
}


window.addEventListener('resize', resizeCanvas)
window.addEventListener('orientationchange', resizeCanvas)
resizeCanvas()

// start preload; any errors will be logged
Program.preload().catch((e)=>{ console.error('Program.preload failed', e) })