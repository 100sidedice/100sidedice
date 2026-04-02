class UpgradesManager {
    constructor(saver) {
        this.saver = saver
        this.shops = null
        this._loadPromise = this._loadShops()
    }

    async _loadShops() {
        try {
            const resp = await fetch('ShootTheStars/data/shops.json')
            this.shops = await resp.json()
        } catch (err) {
            console.warn('UpgradesManager: failed to load shops.json', err)
            this.shops = {}
        }
        return this.shops
    }

    // Return shop definition for an item (keyed by lowercased item name)
    getShopForItem(itemName) {
        if (!itemName) return null
        const key = String(itemName).toLowerCase()
        return this.shops && this.shops[key] ? this.shops[key] : null
    }

    // Synchronously compute a stat after applying purchased upgrades.
    // If shops are not loaded yet, returns the base value.
    getStat(itemName, statName, baseValue) {
        if (!this.shops) return baseValue
        const shop = this.getShopForItem(itemName)
        if (!shop || !shop.items) return baseValue

        // collect modifications in buckets so we can apply (base + adds) * muls
        let addSum = 0
        let mulProduct = 1
        let setValue = undefined

        for (const [upgradeId, def] of Object.entries(shop.items)) {
            const effect = def.effect
            if (!effect || effect.stat !== statName) continue
            let bought = this.saver.getData(`upgrades/${itemName}/${upgradeId}`, 0) || 0
            // compatibility: check old-style display-name key if no purchases found
            if (!bought && def && def.name) {
                const oldBought = this.saver.getData(`upgrades/${itemName}/${def.name}`, 0) || 0
                if (oldBought) bought = oldBought
            }
            if (!bought) continue
            const amt = Number(effect.amount || 0)
            const action = (effect.action || 'add')
            if (action === 'add') {
                let effective = amt * bought
                // support optional harvester-threshold scaling: def.harvester_threshold
                if (def.harvester_threshold) {
                    const threshold = Number(def.harvester_threshold) || 0
                    const harvesters = Number(this.getStat('harvesters', 'amount', 0)) || 0
                    const scale = threshold > 0 ? Math.min(1, harvesters / threshold) : 1
                    effective = effective * scale
                }
                addSum += effective
            } else if (action === 'mul' || action === 'multiply') {
                let effectivePow = Math.pow(amt, bought)
                if (def.harvester_threshold) {
                    const threshold = Number(def.harvester_threshold) || 0
                    const harvesters = Number(this.getStat('harvesters', 'amount', 0)) || 0
                    const scale = threshold > 0 ? Math.min(1, harvesters / threshold) : 1
                    // blend between 1 and effectivePow based on scale
                    effectivePow = 1 + (effectivePow - 1) * scale
                }
                mulProduct *= effectivePow
            } else if (action === 'set') {
                setValue = amt
            }
        }

        let value = (baseValue + addSum) * mulProduct
        if (setValue !== undefined) value = setValue
        try { console.debug(`UpgradesManager.getStat(${itemName}, ${statName}) => ${value} (base ${baseValue}, add ${addSum}, mul ${mulProduct})`) } catch (e) {}
        return value
    }
}

export default UpgradesManager
