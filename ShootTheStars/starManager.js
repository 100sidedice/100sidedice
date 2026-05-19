import { Star } from "./star.js";
import { checkBounds } from "../Support/bounds.js";

export default class StarManager {
    constructor(upgradeManager) {
        this.upgradeManager = upgradeManager;
        this.stars = [];
        this.maxStars = upgradeManager.getData("upgrades", "maxStars");
        window.addEventListener('resize', () => {
            this.stars.forEach(star => {
                if(!checkBounds(star.x, star.y, star.size)){
                    star.onDeath()
                }
            })
        })
    }
    removeStar(star) {
        const starIndex = this.stars.indexOf(star)
        if (starIndex !== -1) {
            this.stars.splice(starIndex, 1)
        }
    }
    update(){
        this.stars.forEach(star => {
            star.update()
            if(!checkBounds(star.x, star.y, star.size)){
                star.onDeath()
            }
        })
        this.spawnStar()
    }
    draw(ctx){
        this.stars.forEach(star => star.draw(ctx))
    }
    spawnStar(){
        if (this.stars.length < this.maxStars) {
            const star = new Star(this.upgradeManager, () => {this.removeStar(star)})
            this.stars.push(star)
        }
    }
}