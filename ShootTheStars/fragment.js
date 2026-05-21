export class Fragment {
    constructor(x, y, vx, vy, color, size, lifetimeFrames = 30) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color || '#fff';
        this.size = size || 2;
        this.framesLeft = lifetimeFrames;
        this.lifetimeFrames = lifetimeFrames;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.framesLeft--;
    }
    draw(ctx) {
        const alpha = Math.max(0, this.framesLeft / this.lifetimeFrames);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}
