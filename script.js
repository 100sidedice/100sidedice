import globalizeSettings from "./settings.js"
globalizeSettings() // Make settings available globally

import { StarGroup } from "./effects/stars.js"
import { HarvesterGroup } from "./effects/harvesters.js"
import Saver from "./Saver.js"
import { Mouse, Keys } from "./input.js"
import UpgradesManager from "./upgrades.js"


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

const itemsContainer = document.querySelector('#items')
let itemsBox = null

function ensureItemsBox() {
    if (!itemsContainer) return null
    if (!itemsBox) {
        itemsBox = document.createElement('ul')
        itemsContainer.appendChild(itemsBox)
    }
    return itemsBox
}

// Calculate upgrade cost ensuring at least +1 per level over starting cost
function calcUpgradeCost(def, level) {
    const base = Number(def?.starting_cost || 1)
    const growth = Number(def?.cost_growth || 1)
    const computed = Math.floor(base * Math.pow(growth, level))
    const linearMin = base + Number(level || 0)
    return Math.max(1, computed, linearMin)
}

// Render and keep the items list synced with saver data
function renderItemsList() {
    const items = window.saver.getData('items') || {}

    // if no items and no shops unlocked, hide early
    if (!items || Object.keys(items).length === 0) return
    // Ensure list exists and build a map of existing li elements by item name
    const box = ensureItemsBox()
    if (!box) return
    const existing = {}
    for (const li of Array.from(box.children)) {
        const name = li.dataset.itemName
        if (name) existing[name] = li
    }

    // Add or update items
    for (const [name, amount] of Object.entries(items)) {
        // If upgrades define this as a shop with an `amount` stat, show derived count
        let displayAmount = amount
        try {
            if (window.upgrades && window.upgrades.shops && window.upgrades.getStat && window.upgrades.shops[name]) {
                // use getStat to derive the active amount (fallback to stored amount)
                const derived = window.upgrades.getStat(name, 'amount', Number(amount) || 0)
                if (derived !== undefined && derived !== null) displayAmount = Math.floor(Number(derived) || 0)
            }
        } catch (e) { /* ignore */ }

        if (existing[name]) {
            existing[name].textContent = `${name}:${displayAmount}`
            delete existing[name]
        } else {
            const li = document.createElement('li')
            li.dataset.itemName = name
            li.className = 'item'
            li.textContent = `${name}:${displayAmount}`
            box.appendChild(li)
        }
    }

    // Remove any leftover list items that are no longer in save data
    for (const leftoverName of Object.keys(existing)) {
        const li = existing[leftoverName]
        if (li && li.parentNode === box) box.removeChild(li)
    }
}

// --- Shop handling --------------------------------------------------
let _shopsCache = null
async function loadShops() {
    if (_shopsCache) return _shopsCache
    try {
        const resp = await fetch('shops.json')
        _shopsCache = await resp.json()
        return _shopsCache
    } catch (err) {
        console.warn('Failed to load shops.json', err)
        return {}
    }
}

function closeShop() {
    const modal = document.getElementById('shop-modal')
    if (!modal) return
    modal.classList.add('hidden')
    modal.setAttribute('aria-hidden', 'true')
    const content = document.getElementById('shop-content')
    if (content) content.innerHTML = ''
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)) }

async function animatePurchaseFinal(entry){
    const fadeMs = Number(SETTINGS.PURCHASE_FADE_MS || 500)
    const particleMs = Number(SETTINGS.PURCHASE_PARTICLE_MS || 700)
    const particleCount = Number(SETTINGS.PURCHASE_PARTICLE_COUNT || 18)
    const particleSpeed = Number(SETTINGS.PURCHASE_PARTICLE_SPEED || 220)

    // ensure entry is positioned to host overlay
    entry.style.position = entry.style.position || 'relative'
    const overlay = document.createElement('div')
    overlay.className = 'purchase-overlay'
    entry.appendChild(overlay)

    // fade to white
    overlay.style.transition = `opacity ${fadeMs}ms ease`
    // trigger
    requestAnimationFrame(()=> overlay.style.opacity = '1')
    await sleep(fadeMs)

    // spawn particles inside shop dialog so they float over UI
    const shopDialog = entry.closest('.shop-dialog') || document.getElementById('shop-modal') || document.body
    const shopRect = shopDialog.getBoundingClientRect()
    const entryRect = entry.getBoundingClientRect()

    const particles = []
    for (let i=0;i<particleCount;i++){
        const p = document.createElement('div')
        p.className = 'purchase-particle'
        // start at center of entry
        const startX = entryRect.left - shopRect.left + entryRect.width/2
        const startY = entryRect.top - shopRect.top + entryRect.height/2
        p.style.left = `${startX - 4}px`
        p.style.top = `${startY - 4}px`
        shopDialog.appendChild(p)
        particles.push(p)
    }

    // animate particles
    const anims = particles.map((p)=>{
        const angle = Math.random() * Math.PI * 2
        const dist = particleSpeed * (0.6 + Math.random() * 0.8)
        const dx = Math.cos(angle) * dist
        const dy = Math.sin(angle) * dist
        const rot = (Math.random()-0.5)*720
        const anim = p.animate([
            { transform: 'translate(0px,0px) rotate(0deg)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: particleMs, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'forwards' })
        return anim.finished.then(()=>{ if (p && p.parentNode) p.parentNode.removeChild(p) })
    })

    // shrink the entry height so layout reflows while particles move
    const origHeight = entry.scrollHeight
    entry.style.transition = `height ${particleMs}ms ease, margin ${particleMs}ms ease, opacity ${particleMs}ms ease` 
    entry.style.height = origHeight + 'px'
    // force layout
    entry.getBoundingClientRect()
    requestAnimationFrame(()=>{
        entry.style.height = '0px'
        entry.style.margin = '0'
        entry.style.opacity = '0'
    })

    // wait for particle animations to complete
    await Promise.all(anims)

    // cleanup overlay and the (now-collapsed) entry
    try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay) } catch(e){}
    try { if (entry && entry.parentNode) entry.parentNode.removeChild(entry) } catch(e){}
    // give a short moment for layout to settle
    await sleep(60)
}

async function openShopForItem(itemName) {
    await window.saver.ready
    const shops = await loadShops()
    const key = itemName.toLowerCase()
    const shop = shops[key]
    const modal = document.getElementById('shop-modal')
    const title = document.getElementById('shop-title')
    const content = document.getElementById('shop-content')
    if (!modal || !content || !title) return
    title.textContent = (shop && shop.header) ? shop.header : `Shop — ${itemName}`
    content.innerHTML = ''

    if (!shop || !shop.items) {
        const empty = document.createElement('div')
        empty.className = 'shop-empty'
        empty.textContent = 'No shop available for this item.'
        content.appendChild(empty)
    } else {
        const list = document.createElement('div')
        list.className = 'shop-list'
        // helper: determine if upgrade is unlocked (supports persistent unlocks)
        const isUnlocked = async (def, itemName, upgradeId) => {
            if (!def || !def.condition) return true
            // already unlocked persistently?
            const persistent = window.saver.getData(`unlocks/${itemName}/${upgradeId}`, false)
            if (persistent) return true

            // condition object may contain multiple keys; satisfy any one of them
            for (const [condKey, threshold] of Object.entries(def.condition)) {
                // try direct path first
                let val = window.saver.getData(condKey, undefined)
                // if not found, try items/<condKey>
                if (val === undefined || val === null) val = window.saver.getData(`items/${condKey}`, undefined)
                if (val === undefined || val === null) continue
                const num = Number(val)
                if (!Number.isNaN(num) && num >= Number(threshold)) {
                    // persist unlock
                    window.saver.setData(`unlocks/${itemName}/${upgradeId}`, true)
                    try { await window.saver.save() } catch(e){}
                    return true
                }
            }
            return false
        }

        // helper: determine if fogged upgrade should reveal (supports persistent reveal)
        const isRevealed = async (def, itemName, upgradeId) => {
            if (!def || !def.fog_condition) return true
            const persistent = window.saver.getData(`unlocks/${itemName}/${upgradeId}_fog`, false)
            if (persistent) return true
            for (const [condKey, threshold] of Object.entries(def.fog_condition)) {
                let val = window.saver.getData(condKey, undefined)
                if (val === undefined || val === null) val = window.saver.getData(`items/${condKey}`, undefined)
                if (val === undefined || val === null) continue
                const num = Number(val)
                if (!Number.isNaN(num) && num >= Number(threshold)) {
                    window.saver.setData(`unlocks/${itemName}/${upgradeId}_fog`, true)
                    try { await window.saver.save() } catch(e){}
                    return true
                }
            }
            return false
        }

        for (const [upgradeId, def] of Object.entries(shop.items)) {
            const displayName = def.name || upgradeId
            const max = def.max || Infinity

            // check unlock condition (if present)
            const unlocked = await isUnlocked(def, itemName, upgradeId)
            if (!unlocked) continue

            // check fog condition: if not revealed, render a fogged placeholder
            const revealed = await isRevealed(def, itemName, upgradeId)
            if (!revealed) {
                const fogEntry = document.createElement('button')
                fogEntry.className = 'shop-entry fogged'
                fogEntry.type = 'button'
                const labelSpan = document.createElement('span')
                labelSpan.className = 'label'
                labelSpan.textContent = '???'
                const metaSpan = document.createElement('span')
                metaSpan.className = 'meta'
                metaSpan.textContent = '???'
                fogEntry.appendChild(labelSpan)
                fogEntry.appendChild(metaSpan)
                fogEntry.disabled = true
                list.appendChild(fogEntry)
                continue
            }

            // determine how many have been bought (support legacy display-name keys)
            let current = window.saver.getData(`upgrades/${itemName}/${upgradeId}`, 0) || 0
            if (!current && def && def.name) {
                current = window.saver.getData(`upgrades/${itemName}/${def.name}`, 0) || 0
            }

            // if already at or above max, skip rendering this upgrade (prevents reappearing after final animation)
            if (current >= max) continue

            const entry = document.createElement('button')
            entry.className = 'shop-entry'
            entry.type = 'button'

            const metaSpan = document.createElement('span')
            metaSpan.className = 'meta'

            const labelSpan = document.createElement('span')
            labelSpan.className = 'label'
            labelSpan.textContent = displayName

            entry.appendChild(labelSpan)
            entry.appendChild(metaSpan)

            // render/refresh function for this entry so UI stays accurate
            const refresh = () => {
                const cur = window.saver.getData(`upgrades/${itemName}/${upgradeId}`, 0) || 0
                const cost = calcUpgradeCost(def, cur)
                metaSpan.textContent = `${cur}/${max} — ${cost}`
            }
            refresh()

            entry.addEventListener('click', async () => {
                const currentInside = window.saver.getData(`upgrades/${itemName}/${upgradeId}`, 0) || 0
                if (currentInside >= max) return
                const cost = calcUpgradeCost(def, currentInside)
                // shop-level currency override (default to the shop key)
                const shopCurrencyKey = (shop && shop.currency) ? shop.currency : itemName
                const currencyKey = def && def.currency ? def.currency : shopCurrencyKey
                let currencyAvailable = 0
                let currencyIsShop = false
                try {
                    if (window.upgrades && window.upgrades.shops && window.upgrades.shops[currencyKey]) {
                        currencyAvailable = Math.floor(Number(window.upgrades.getStat(currencyKey, 'amount', window.saver.getData(`items/${currencyKey}`, 0))) || 0)
                        currencyIsShop = true
                    } else {
                        currencyAvailable = window.saver.getData(`items/${currencyKey}`, 0) || 0
                    }
                } catch (e) { currencyAvailable = window.saver.getData(`items/${currencyKey}`, 0) || 0 }
                if (currencyAvailable < cost) {
                    entry.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}], {duration:220})
                    return
                }
                // perform purchase
                if (currencyIsShop) {
                    // deduct from shop's amount upgrade (consume harvesters)
                    const prevAmt = window.saver.getData(`upgrades/${currencyKey}/amount`, 0) || 0
                    window.saver.setData(`upgrades/${currencyKey}/amount`, Math.max(0, prevAmt - cost))
                } else {
                    window.saver.setData(`items/${currencyKey}`, currencyAvailable - cost)
                }
                window.saver.setData(`upgrades/${itemName}/${upgradeId}`, currentInside + 1)
                // if this upgrade unlocks a shop, persist that and create the shop item so it's clickable
                if (def && def.unlocks_shop) {
                    const shopKey = def.unlocks_shop
                    window.saver.setData(`unlocks/shops/${shopKey}`, true)
                    // create a zero-count item so it appears in items list
                    const items = window.saver.getData('items') || {}
                    if (!(shopKey in items)) {
                        window.saver.setData(`items/${shopKey}`, 0)
                    }
                    // Give one free unit of the new shop's primary amount upgrade if applicable
                    try {
                        const prev = window.saver.getData(`upgrades/${shopKey}/amount`, 0) || 0
                        window.saver.setData(`upgrades/${shopKey}/amount`, prev + 1)
                    } catch (e) { console.warn('failed to grant free harvester', e) }
                }
                await window.saver.save()
                const newCurrent = currentInside + 1
                const finalBought = (newCurrent >= max)
                if (finalBought) {
                    // animate completion: fade -> particles -> shrink layout
                    try {
                        await animatePurchaseFinal(entry)
                    } catch (e) { console.warn('purchase animation failed', e) }
                    // after animation refresh shop (entry will be skipped if now at max)
                    openShopForItem(itemName)
                } else {
                    // refresh UI of this shop
                    openShopForItem(itemName)
                }
            })
            list.appendChild(entry)
        }
        content.appendChild(list)
    }

    modal.classList.remove('hidden')
    modal.setAttribute('aria-hidden', 'false')
}

// delegate clicks on items container to open shop (ul may be created dynamically)
if (itemsContainer) {
    itemsContainer.addEventListener('click', (ev) => {
        let el = ev.target
        while (el && el !== itemsContainer) {
            if (el.matches && el.matches('.item')) {
                const name = el.dataset.itemName
                if (name) openShopForItem(name)
                return
            }
            el = el.parentNode
        }
    })
}

// close button
document.addEventListener('click', (ev) => {
    if (ev.target && ev.target.id === 'shop-close') closeShop()
})

// close modal on escape
window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeShop()
})


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
        this.harvesterGroup = new HarvesterGroup(this.starGroup)
        this.starGroup.spawnInitalStars()
        
        this.autosaveInterval = 10000 // 10 seconds
        this.lastAutosave = performance.now()
        // Start autosave timer
        this.autosaveTimer = setInterval(() => {
            window.saver.save()
        }, this.autosaveInterval)
    }
    draw() {
        // draw using CSS-pixel coordinates
        ctx.fillStyle = '#06021a'
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

        this.starGroup.draw(ctx)
        if (this.harvesterGroup) this.harvesterGroup.draw(ctx)
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
        if (this.harvesterGroup) this.harvesterGroup.update(this.deltaTime)
        
        if (window.saver) renderItemsList() // keep items list in sync


        this.draw()
        window.requestAnimationFrame(this.update.bind(this))
    }
}


window.addEventListener('resize', resizeCanvas)
window.addEventListener('orientationchange', resizeCanvas)
resizeCanvas()

// Initialize app after saver and upgrades are ready so upgrades take effect immediately
let program
;(async function init(){
    await window.saver.ready
    // wait for upgrades to finish loading shops if available
    try { if (window.upgrades && window.upgrades._loadPromise) await window.upgrades._loadPromise } catch(e){}
    // start syncing and render initial items
    startItemsSync()
    renderItemsList()
    program = new Program()
    program.update()
    console.info('App initialized: saver and upgrades ready')
})()