class StarFragment {
    constructor(fragmentGroup, pos, size, speed, angle) {
        this.fragmentGroup = fragmentGroup;
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        this.angle = angle;
        this.life = 1; // life goes from 1 to 0, at which point the fragment is removed
    }
    update(deltaTime) {
        this.pos.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.pos.y += Math.sin(this.angle) * this.speed * deltaTime;
        this.life -= deltaTime; // fade out over 1 second
        if (this.life <= 0) {
            this.fragmentGroup.remove(this);
        }
    }
    draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Star {
    constructor(starGroup) {
        this.starGroup = starGroup
        this.pos = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        };
        this.size = Math.random() * (SETTINGS.STAR_SIZE_MAX - SETTINGS.STAR_SIZE_MIN) + SETTINGS.STAR_SIZE_MIN;
        this.speed = Math.random() * (SETTINGS.STAR_SPEED_MAX - SETTINGS.STAR_SPEED_MIN) + SETTINGS.STAR_SPEED_MIN;
        this.angle = Math.random() * 2 * Math.PI;
    }
    update(deltaTime) {
        this.pos.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.pos.y += Math.sin(this.angle) * this.speed * deltaTime;
        if (this.pos.x < 0 || this.pos.x > window.innerWidth || this.pos.y < 0 || this.pos.y > window.innerHeight) {
            this.starGroup.remove(this);
        }
        if (window?.mouse.left.isHeld()){
            const dx = this.pos.x - window.mouse.x;
            const dy = this.pos.y - window.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < SETTINGS.STAR_SIZE_MAX + 10) {
                // Spawn fragments
                for (let i = 0; i < SETTINGS.FRAGMENTS_PER_STAR; i++) {
                    const angle = Math.random() * 2 * Math.PI;
                    const speed = Math.random() * 100 + 50;
                    const size = this.size / 4;
                    this.starGroup.fragments.push(new StarFragment(this.starGroup, {x: this.pos.x, y: this.pos.y}, size, speed, angle));
                }
                window.saver.setData('starfragments', (window.saver.getData('items/starfragments') || 0) + 1);
                this.starGroup.remove(this);
            }
        }
    }
}
export class StarGroup {
    constructor() {
        this.stars = [];
        this.fragments = [];
    }
    spawnInitalStars() {
        for (let i = 0; i < SETTINGS.STAR_COUNT; i++) {
            this.add(new Star(this));
        }
    }
    add(star) {
        this.stars.push(star);
    }
    remove(star) {
        const index = this.stars.indexOf(star);
        if (index > -1) {
            this.stars.splice(index, 1);
        }
    }
    update(deltaTime) {
        for (const star of this.stars) {
            star.update(deltaTime);
        }
        for (const fragment of this.fragments) {
            fragment.update(deltaTime);
        }
        if (this.stars.length < SETTINGS.STAR_COUNT) {
            this.add(new Star(this));
        }

    }
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        for (const star of this.stars) {
            ctx.beginPath();
            ctx.arc(star.pos.x, star.pos.y, star.size, 0, 2 * Math.PI);
            ctx.fill();
        }
        for (const fragment of this.fragments) {
            fragment.draw(ctx);
        }
    }
}