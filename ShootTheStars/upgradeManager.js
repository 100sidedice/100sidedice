import { save } from "../Support/save.js"
import { loadSave } from "../Support/save.js"
import { Star } from "./star.js";
import { Item } from "./items.js";

export default class UpgradeManager {
    constructor(save) {
        this.data = save.upgrades;
        this.upgrades = save.upgrades
        this.save = save
        this.items = {}
        this.generateItemList()
        this.shopInFocus = null;

        // we'll make f8 give infinite star fragments for testing purposes
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F8') {
                this.addItemValue('starFragments', 10000000000000);
            }  
        })
    }
    generateItemList(){
        this.items = {}
        const itemBar = document.getElementById('items-container');
        const itemShop = document.getElementById('item-shop');
        itemBar.innerHTML = '';
        itemShop.innerHTML = '';
        for(const key of this.getData('unlockedItems')){
            const itemElement = document.createElement('p');
            itemElement.id = key;
            itemElement.classList.add('item');
            this.items[key] = new Item(itemElement, this.getData('itemData', key), itemBar, itemShop, this)
            itemBar.appendChild(itemElement);
        }
    }
    update(){
        const unlockLevel = this.getData('itemData', 'starFragments', "shopData")[2].level;
        const paintUnlockLevel = this.getData('itemData', 'starFragments', "shopData")[3].level;
        const dragonItem = this.getData('itemData', 'dragons');
        const paintDragonBoost = this.getUpgradeById('paint', 'paintMoreDragons').level;
        const dragonCount = unlockLevel >= 1 ? 1 + dragonItem.shopData[0].level + paintDragonBoost : 0;

        if (unlockLevel >= 1 && !this.getData('unlockedItems').includes('dragons')) {
            this.getData('unlockedItems').push('dragons');
            this.generateItemList();
        }

        if (paintUnlockLevel >= 1 && !this.getData('unlockedItems').includes('paint')) {
            this.getData('unlockedItems').push('paint');
            this.generateItemList();
        }

        if (dragonItem.value !== dragonCount) {
            dragonItem.value = dragonCount;
            if (this.items.dragons) {
                this.items.dragons.update();
            }
        }
    }
    /**
     * Calculate a generic upgrade-driven value using formula: ((add) * mult) ** exp
     *
     * This accepts either:
     * - an array of upgrade entries
     * - an object whose values contain upgrade lists (default `shopData`)
     *
     * @param {Array|Object} source upgrade entries or upgrade groups
     * @param {number} base base additive amount (defaults to 1)
     * @param {Object} options config for property names and type aliases
     * @returns {number} calculated value
     */
    calculateUpgradeValue(source, base = 1, options = {}) {
        if (!source) return base;

        const config = {
            groupKey: 'shopData',
            levelKey: 'level',
            typeKey: 'upgradeType',
            additiveTypes: ['additive', 'add', 'flat'],
            multiplicativeTypes: ['multiplicative', 'mult', 'multiply'],
            exponentialTypes: ['exponential', 'exp', 'power'],
            ...options,
        };

        const groups = Array.isArray(source)
            ? [source]
            : (Array.isArray(source.shopData) ? [source.shopData] : Object.values(source));

        let addSum = 0;
        let multSum = 0;
        let expSum = 0;

        for (const group of groups) {
            const upgrades = Array.isArray(group) ? group : group?.[config.groupKey];
            if (!Array.isArray(upgrades)) continue;

            for (const upg of upgrades) {
                const lvl = Number(upg?.[config.levelKey] ?? 0) || 0;
                if (!lvl) continue;

                const type = String(upg?.[config.typeKey] ?? upg?.scaleType ?? '').toLowerCase();

                if (config.additiveTypes.includes(type)) {
                    addSum += lvl;
                } else if (config.multiplicativeTypes.includes(type)) {
                    multSum += (1 + lvl);
                } else if (config.exponentialTypes.includes(type)) {
                    expSum += (1 + lvl);
                }
            }
        }

        const add = base + addSum;
        const mult = multSum || 1;
        const exp = expSum || 1;
        return Math.pow(add * mult, exp);
    }

    addItemValue(itemKey, amount = null, refresh = true) {
        const item = this.getData('itemData', itemKey);
        if (!item) {
            return 0;
        }
        let gain = amount ?? this.calculateUpgradeValue(item.shopData, 1);

        // Apply cross-item upgrades for star fragment gain only.
        if (itemKey === 'starFragments') {
            const sacrifice = this.getUpgradeById('dragons', 'sacrificeDragon');
            const sacrificeLevel = sacrifice.level;
            const paintCatalystsLevel = this.getUpgradeById('paint', 'paintFragmentGain').level;

            if (sacrificeLevel > 0) {
                const sacrificeMultiplier = 1 + sacrificeLevel;
                gain = gain * sacrificeMultiplier;
            }
            if (paintCatalystsLevel > 0) {
                const paintMultiplier = 1 + (paintCatalystsLevel * 0.25);
                gain = gain * paintMultiplier;
            }
        }
        item.value = (Number(item.value) || 0) + gain;

        if (refresh && this.items[itemKey]) {
            this.items[itemKey].update();
        }
        return gain;
    }

    getShopItem(itemKey) {
        return this.getData('itemData', itemKey);
    }

    getUpgradeById(itemKey, upgradeId) {
        const item = this.getShopItem(itemKey);
        if (!item || !Array.isArray(item.shopData)) {
            return null;
        }
        return item.shopData.find(upgrade => upgrade.id === upgradeId) ?? null;
    }

    getUpgradeCost(upgrade) {
        if (!upgrade || upgrade.baseCost == null) {
            return { currency: null, amount: 0 };
        }

        const level = Number(upgrade.level ?? 0) || 0;

        if (typeof upgrade.baseCost === 'number') {
            return { currency: null, amount: upgrade.baseCost };
        }

        const currency = upgrade.baseCost.currency ?? null;
        const baseAmount = Number(upgrade.baseCost.amount ?? 0) || 0;
        const scaleAmount = Number(upgrade.scaleAmount ?? 1) || 1;
        const scaleType = String(upgrade.scaleType ?? '').toLowerCase();

        let amount = baseAmount;
        if (scaleType === 'additive' || scaleType === 'add' || scaleType === 'flat') {
            amount = baseAmount + (scaleAmount * level);
        } else if (scaleType === 'multiplicative' || scaleType === 'mult' || scaleType === 'multiply') {
            amount = baseAmount * Math.pow(scaleAmount, level);
        } else if (scaleType === 'exponential' || scaleType === 'exp' || scaleType === 'power') {
            amount = Math.pow(baseAmount, Math.pow(scaleAmount, level));
        }

        return { currency, amount };
    }

    canAfford(currencyKey, amount) {
        if (!currencyKey) {
            return true;
        }

        const currencyItem = this.getData('itemData', currencyKey);
        return !!currencyItem && (Number(currencyItem.value) || 0) >= amount;
    }

    calculateCostToLevel(upgrade, targetLevel) {
        if (targetLevel <= 0) return 0;

        const baseAmount = Number(upgrade.baseCost?.amount ?? upgrade.baseCost ?? 0) || 0;
        const scaleAmount = Number(upgrade.scaleAmount ?? 1) || 1;
        const scaleType = String(upgrade.scaleType ?? '').toLowerCase();
        const currentLevel = Number(upgrade.level ?? 0) || 0;

        let totalCost = 0;
        if (scaleType === 'additive' || scaleType === 'add' || scaleType === 'flat') {
            // Sum from currentLevel to targetLevel-1: baseAmount + scaleAmount*i
            // = baseAmount*levels + scaleAmount*(currentLevel + currentLevel+1 + ... + targetLevel-1)
            const levels = targetLevel - currentLevel;
            totalCost = baseAmount * levels + scaleAmount * (levels * currentLevel + (levels * (levels - 1)) / 2);
        } else if (scaleType === 'multiplicative' || scaleType === 'mult' || scaleType === 'multiply') {
            // Sum from currentLevel to targetLevel-1: baseAmount * scaleAmount^i
            // Geometric series: a(r^n - 1)/(r - 1) where a=baseAmount*scaleAmount^currentLevel, r=scaleAmount
            if (scaleAmount === 1) {
                totalCost = baseAmount * (targetLevel - currentLevel);
            } else {
                const a = baseAmount * Math.pow(scaleAmount, currentLevel);
                const r = scaleAmount;
                const n = targetLevel - currentLevel;
                totalCost = a * (Math.pow(r, n) - 1) / (r - 1);
            }
        } else {
            // Exponential: use safe iteration with limit
            let cost = 0;
            for (let level = currentLevel; level < targetLevel && level - currentLevel < 1000; level++) {
                const levelCost = baseAmount * Math.pow(scaleAmount, level);
                cost += levelCost;
            }
            totalCost = cost;
        }

        return Math.ceil(totalCost);
    }

    calculateMaxLevelsPurchasable(upgrade, currencyKey) {
        const maxLevel = Number(upgrade.maxLevel ?? Infinity);
        const currentLevel = Number(upgrade.level ?? 0) || 0;
        if (currentLevel >= maxLevel) return 0;

        const currencyItem = this.getData('itemData', currencyKey);
        if (!currencyItem) return 0;

        const availableCurrency = Number(currencyItem.value) || 0;
        const levelsToMax = maxLevel - currentLevel;

        // Binary search to find max levels purchasable
        let low = 0;
        let high = levelsToMax;
        let maxPurchasable = 0;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const cost = this.calculateCostToLevel(upgrade, currentLevel + mid);

            if (cost <= availableCurrency) {
                maxPurchasable = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return maxPurchasable;
    }

    spendCurrency(currencyKey, amount) {
        if (!currencyKey || amount <= 0) {
            return true;
        }

        const currencyItem = this.getData('itemData', currencyKey);
        if (!currencyItem) {
            return false;
        }

        const currentValue = Number(currencyItem.value) || 0;
        if (currentValue < amount) {
            return false;
        }

        currencyItem.value = currentValue - amount;
        if (this.items[currencyKey]) {
            this.items[currencyKey].update();
        }
        return true;
    }

    purchaseUpgrade(itemKey, upgradeId) {
        const item = this.getShopItem(itemKey);
        const upgrade = this.getUpgradeById(itemKey, upgradeId);
        if (!item || !upgrade) {
            return false;
        }

        const maxLevel = Number(upgrade.maxLevel ?? Infinity);
        const currentLevel = Number(upgrade.level ?? 0) || 0;
        if (currentLevel >= maxLevel) {
            return false;
        }

        const cost = this.getUpgradeCost(upgrade);
        if (!this.canAfford(cost.currency, cost.amount)) {
            return false;
        }

        // Calculate max levels purchasable
        const maxLevelsPurchasable = this.calculateMaxLevelsPurchasable(upgrade, cost.currency);
        if (maxLevelsPurchasable <= 0) {
            return false;
        }

        // Calculate total cost for all levels being purchased
        const newLevel = Math.min(currentLevel + maxLevelsPurchasable, maxLevel);
        const totalCost = this.calculateCostToLevel(upgrade, newLevel);

        if (!this.spendCurrency(cost.currency, totalCost)) {
            return false;
        }

        upgrade.level = newLevel;

        if (this.items[itemKey]) {
            this.items[itemKey].update();
        }

        save('save', this.save);
        return true;
    }

    getData(...path) {
        let current = this.data
        for (const key of path) {
            if (current[key] === undefined) {
                return null
            }
            current = current[key]
        }
        return current
    }
}