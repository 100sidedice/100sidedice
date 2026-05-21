import { Star } from "./star.js";
import { checkBounds } from "../Support/bounds.js";
import InputManager from "./inputManager.js";
import { Fragment } from "./fragment.js";

export default class StarManager {
    constructor(upgradeManager) {
        this.upgradeManager = upgradeManager;
        this.stars = [];
        this.maxStars = upgradeManager.getData("upgrades", "maxStars");
        const canvas = document.getElementById('stsCanvas');
        this.input = new InputManager(canvas, this);
        this.input.addEvents();
        this.fragments = [];
        window.addEventListener('resize', () => {
            this.stars.forEach(star => {
                if(!checkBounds(star.x, star.y, star.size)){
                    star.onDeath()
                }
            })
        })
        this.dragons = [];
    }
    removeStar(star) {
        const starIndex = this.stars.indexOf(star)
        if (starIndex !== -1) {
            // spawn a few fragments for visual flare
            const count = 3 + Math.floor(Math.random() * 2); // 3-4 fragments
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.5 + Math.random() * 1.5;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const size = Math.max(1, star.size * 0.25);
                const frag = new Fragment(star.x, star.y, vx, vy, star.color, size, 30);
                this.fragments.push(frag);
            }
            this.stars.splice(starIndex, 1)
        }
    }
    collectStar(star) {
        if (!star || star._collected) {
            return;
        }
        star._collected = true;
        this.upgradeManager.addItemValue('starFragments');
        star.onDeath();
    }
    update(){
        const canvas = this.input?.canvas || document.getElementById('stsCanvas');
        const cw = canvas.width || window.innerWidth;
        const ch = canvas.height || window.innerHeight;
        const minHalf = Math.min(cw, ch) / 2;
        const edgeMargin = 120; // px - approximate UI area to start despawn timer

        this.stars.forEach(star => {
            star.update()

            // compute distance to center and compare to half the screen diagonal
            const centerX = cw / 2;
            const centerY = ch / 2;
            const distToCenter = Math.hypot(star.x - centerX, star.y - centerY);
            const halfDiag = Math.hypot(cw, ch) / 2;
            // percentage from center (0=center, 1=edge/corner)
            const pct = Math.max(0, Math.min(distToCenter / halfDiag, 1));
            // start off-edge despawn when fairly close to edge
            const startThreshold = 0.6;
            if (pct >= startThreshold) {
                // map pct to allowed seconds: center->10s, edge->1s
                const allowedSec = 10 - (9 * pct); // lerp(10,1,pct)
                const allowedFrames = Math.ceil(allowedSec * 60);
                if (star._offEdgeFrames == null) {
                    star._offEdgeFrames = allowedFrames;
                }
                star._offEdgeFrames -= 1;
                if (star._offEdgeFrames <= 0) {
                    star.onDeath();
                    return;
                }
            } else {
                star._offEdgeFrames = null;
            }

            if(!checkBounds(star.x, star.y, star.size)){
                star.onDeath()
            }
        })
        this.spawnStar()
        // Process input cursors and collect stars under them
        if (this.input && this.input.cursors && this.input.cursors.length > 0) {
            const rect = this.input.canvas.getBoundingClientRect();
            const scaleX = this.input.canvas.width / rect.width;
            const scaleY = this.input.canvas.height / rect.height;
            // iterate over a copy since onDeath removes from this.stars
            for (const cursor of this.input.cursors) {
                const cx = (cursor.x - rect.left) * scaleX;
                const cy = (cursor.y - rect.top) * scaleY;
                const cursorRadiusCanvas = ((cursor.r ?? 8) * ((scaleX + scaleY) / 2));
                for (const star of [...this.stars]) {
                    const dx = star.x - cx;
                    const dy = star.y - cy;
                    const dist = Math.hypot(dx, dy);
                    const hitRadius = (star.collectionRadius ?? star.size) + cursorRadiusCanvas;
                    if (dist <= hitRadius) {
                        this.collectStar(star);
                    }
                }
            }
        }
        // update fragments
        for (const f of this.fragments) f.update();
        this.fragments = this.fragments.filter(f => f.framesLeft > 0);


        // update dragons
        if(this.dragons.length < this.upgradeManager.getData("itemData", "dragons", "value")){
            const dragonImage = new Image();
            dragonImage.src = 'assets/dragon.png';
            this.dragons.push(new Dragon(dragonImage, this.upgradeManager, this));
        }
    }
    draw(ctx){
        this.stars.forEach(star => star.draw(ctx))
        // draw fragments on top
        this.fragments.forEach(f => f.draw(ctx));
    }
    spawnStar(){
        if (this.stars.length < this.maxStars) {
            const star = new Star(this.upgradeManager, () => {this.removeStar(star)})
            this.stars.push(star)
        }
    }
}