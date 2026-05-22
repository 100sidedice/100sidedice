export default class Dragon {
    constructor(image, upgradeManager, starManager) {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * (window.innerDVH ?? window.innerHeight); // innerDVH is for mobile browsers that support it, otherwise fallback to innerHeight
        this.velX = 0;
        this.velY = 0;
        this.upgradeManager = upgradeManager;
        this.starManager = starManager;
        this.image = image;
        this.targetStar = null;
    }
    update(){
        if (!this.starManager.stars.length) {
            this.targetStar = null;
            this.velX = 0;
            this.velY = 0;
            return;
        }

        // Keep the target stable while it still exists, otherwise pick the nearest free star.
        if (!this.targetStar || !this.starManager.stars.includes(this.targetStar)) {
            this.targetStar = this.getNearestAvailableStar();
        }

        if (!this.targetStar) {
            this.velX = 0;
            this.velY = 0;
            return;
        }

        const targetX = this.targetStar.x;
        const targetY = this.targetStar.y;

        // Move toward the current target and collect it once we get close enough.
        const dragonData = this.upgradeManager.getData("itemData", "dragons");
        const accuracy = 1.5 + (dragonData.shopData[0].level * 0.2);
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.velX = (dx / dist) * accuracy;
            this.velY = (dy / dist) * accuracy;
            this.x += this.velX;
            this.y += this.velY;
        }

        const collectionRadius = 12 + (dragonData.shopData[1].level * 2);
        if (dist <= collectionRadius) {
            const collectedStar = this.targetStar;
            this.targetStar = null;
            this.starManager.collectStar(collectedStar);
            this.velX = 0;
            this.velY = 0;
        }
    }
    draw(ctx){
        const size = 12;
        if (!this.image || !this.image.complete || this.image.naturalWidth === 0) {
            return;
        }
        const targetX = this.targetStar?.x ?? (this.x - 1);
        const targetY = this.targetStar?.y ?? this.y;
        const maxTilt = 20 * (Math.PI / 180);
        const movingRight = targetX > this.x;
        let angle = Math.atan2(targetY - this.y, targetX - this.x) + Math.PI;

        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        angle = Math.max(-maxTilt, Math.min(maxTilt, angle));

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        if (movingRight) {
            ctx.scale(-1, 1);
        }
        ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
        ctx.restore();
    }
    getNearestAvailableStar(){
        const sortedStars = this.starManager.stars.slice().sort((a, b) => {
            const distA = Math.hypot(a.x - this.x, a.y - this.y);
            const distB = Math.hypot(b.x - this.x, b.y - this.y);
            return distA - distB;
        });

        for (const star of sortedStars) {
            const alreadyTargeted = this.starManager.dragons.some(dragon => dragon !== this && dragon.targetStar === star);
            if (!alreadyTargeted) {
                return star;
            }
        }

        return sortedStars[0] ?? null;
    }
}