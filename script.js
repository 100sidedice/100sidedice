import globalizeSettings from "./settings.js"
globalizeSettings() // Make settings available globally

import { StarGroup } from "./effects/stars.js"
import Saver from "./Saver.js"
import { Mouse, Keys } from "./input.js"


// Input instances (globalized in input.js as classes)

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

/**
 * messy, but in this case just easier
 */
window.mouse = new Mouse(canvas)
window.keys = new Keys()
window.saver = new Saver({dbName: '100sidedice', saveId: 'default'})


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

const itemsBox = document.querySelector('#items ul') 

// Render and keep the items list synced with saver data
function renderItemsList() {
    const items = window.saver.getData('items') || {}

    // Build a map of existing li elements by item name
    const existing = {}
    for (const li of Array.from(itemsBox.children)) {
        const name = li.dataset.itemName
        if (name) existing[name] = li
    }

    // Add or update items
    for (const [name, amount] of Object.entries(items)) {
        if (existing[name]) {
            existing[name].textContent = `${name}:${amount}`
            delete existing[name]
        } else {
            const li = document.createElement('li')
            li.dataset.itemName = name
            li.textContent = `${name}:${amount}`
            itemsBox.appendChild(li)
        }
    }

    // Remove any leftover list items that are no longer in save data
    for (const leftoverName of Object.keys(existing)) {
        const li = existing[leftoverName]
        if (li && li.parentNode === itemsBox) itemsBox.removeChild(li)
    }
}

// Polling update for live updates (keeps list current even if saver is changed elsewhere)
let _itemsSyncInterval = null
function startItemsSync(pollMs = 500) {
    if (_itemsSyncInterval) return
    _itemsSyncInterval = setInterval(renderItemsList, pollMs)
}
function stopItemsSync() {
    if (!_itemsSyncInterval) return
    clearInterval(_itemsSyncInterval)
    _itemsSyncInterval = null
}

/**
 * Main program class
 */
class Program {
    constructor() {
        this.starGroup = new StarGroup()
        this.starGroup.spawnInitalStars()
        
        this.autosaveInterval = 10000 // 10 seconds
        this.lastAutosave = performance.now()
        // Start autosave timer
        this.autosaveTimer = setInterval(() => {
            window.saver.save()
        }, this.autosaveInterval)

        window.saver.ready.then(() => {
            // Initial render and start syncing the items list
            renderItemsList()
            startItemsSync()

            // Patch saver methods so changes immediately update the UI
            if (window.saver && typeof window.saver.setData === 'function') {
                const _origSet = window.saver.setData.bind(window.saver)
                window.saver.setData = function(path, value) {
                    const res = _origSet(path, value)
                    try { renderItemsList() } catch (e) {}
                    return res
                }
            }
            if (window.saver && typeof window.saver.save === 'function') {
                const _origSave = window.saver.save.bind(window.saver)
                window.saver.save = async function() {
                    const res = await _origSave()
                    try { renderItemsList() } catch (e) {}
                    return res
                }
            }
        })
    }
    draw() {
        // draw using CSS-pixel coordinates
        ctx.fillStyle = '#06021a'
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

        this.starGroup.draw(ctx)
    }
    update(){
        // deltaTime in seconds
        const now = performance.now()
        this.deltaTime = (now - (this.lastTime || now)) / 1000
        this.lastTime = now

        // update inputs first so one-frame flags behave consistently
        if (window.keys) window.keys.update(this.deltaTime)
        if (window.mouse) window.mouse.update(this.deltaTime)

        this.starGroup.update(this.deltaTime)
        
        this.draw()
        window.requestAnimationFrame(this.update.bind(this))
    }
}


window.addEventListener('resize', resizeCanvas)
window.addEventListener('orientationchange', resizeCanvas)
resizeCanvas()

let program
program = new Program()
program.update()