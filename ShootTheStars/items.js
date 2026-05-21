import { capSigFig } from "../Support/numberStuff.js";

export class Item {
    constructor(me, data, itemBar, itemShop, upgradeManager) {
        this.me = me;
        this.data = data;
        this.itemBar = itemBar;
        this.itemShop = itemShop;
        this.upgradeManager = upgradeManager;

        this.me.addEventListener('click', () => {
            if (this.itemShop.classList.contains('itemShopHidden')) {
                this.openShop();
                this.upgradeManager.shopInFocus = this.data.key;
            } else if (this.upgradeManager.shopInFocus === this.data.key) {
                this.closeShop();
            } else {
                this.openShop();
                this.upgradeManager.shopInFocus = this.data.key;
            }
        });
        this.update();
    }
    update() {
        this.me.textContent = this.data.displayName + ': ';
        this.me.textContent += capSigFig(this.data.value, 3).toLocaleString();
    }
    openShop() {
        this.itemShop.classList.remove('itemShopHidden');
        this.itemShop.innerHTML = `<h2>${this.data.displayName} Shop</h2>`;

        const table = document.createElement('table');
        table.classList.add('shop-table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Name</th>
                <th>Level</th>
                <th>Cost</th>
            </tr>
        `;

        const tbody = document.createElement('tbody');
        for (const upgrade of this.data.shopData) {
            if (!this.upgradeManager.canAfford(upgrade.fog?.currency, upgrade.fog?.amount)) {
                continue;
            }
            const row = document.createElement('tr');
            const upgradeId = upgrade.id ?? upgrade.name ?? '';
            const cost = this.upgradeManager.getUpgradeCost(upgrade);
            const canAfford = this.upgradeManager.canAfford(cost.currency, cost.amount);
            const maxLevel = Number(upgrade.maxLevel ?? Infinity);
            const atMax = (Number(upgrade.level ?? 0) || 0) >= maxLevel;
            row.classList.add('shop-row');
            if (atMax) {
                row.classList.add('shop-row-max');
            } else if (!canAfford) {
                row.classList.add('shop-row-unaffordable');
            }
            row.innerHTML = `
                <td>${upgrade.name ?? upgrade.id ?? 'Unnamed Upgrade'}</td>
                <td>${upgrade.level ?? '-'}</td>
                <td>${this.formatCost(cost)}</td>
            `;

            if (!atMax) {
                row.addEventListener('click', () => {
                    this.upgradeManager.purchaseUpgrade(this.data.key, upgradeId);
                    this.openShop(); // Refresh shop after purchase
                });
            }
            tbody.appendChild(row);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        this.itemShop.appendChild(table);
    }
    closeShop() {
        this.itemShop.classList.add('itemShopHidden');
        this.upgradeManager.shopInFocus = null;
    }
    formatCost(cost) {
        if (cost == null) {
            return '-';
        }

        if (typeof cost === 'number') {
            return capSigFig(cost, 3).toLocaleString();
        }

        if (typeof cost === 'object') {
            const amount = cost.amount ?? '-';
            const currency = cost.currency ?? '';
            const currencyData = currency ? this.upgradeManager?.getData('itemData', currency) : null;
            const currencyName = currencyData?.displayName ?? currency;
            return currencyName ? `${capSigFig(amount, 3).toLocaleString()} ${currencyName}` : capSigFig(amount, 3).toLocaleString();
        }

        return String(cost);
    }
}