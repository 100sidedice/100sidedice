class Dragon {
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
        // if we don't have a target star, find the nearest one - but skip any that are already targeted by other dragons
        const starIndex = 0;
        const nearestStar = this.getNearestStar(0);
        this.starManager.dragons.forEach(dragon => {
            if(dragon.targetStar === nearestStar){
                starIndex++;
                nearestStar = this.starManager.getNearestStar(starIndex);
            }
        });
        const targetX = nearestStar.x;
        const targetY = nearestStar.y;


        // now we know the target star, we can move towards it
        const accuracy = this.upgradeManager.getData("upgrades", "dragonAccuracy")
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.velX = (dx / dist) * accuracy;
            this.velY = (dy / dist) * accuracy;
        }
    }
    draw(){

    }
    getNearestStar(index){
        const sortedStars = this.starManager.stars.slice().sort((a, b) => {
            const distA = Math.hypot(a.x - this.x, a.y - this.y);
            const distB = Math.hypot(b.x - this.x, b.y - this.y);
            return distA - distB;
        });
        return sortedStars[index];
    }
}