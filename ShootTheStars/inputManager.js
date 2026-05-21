export default class InputManager {
    constructor(canvas, starManager) {
        this.canvas = canvas;
        this.cursors =  []; // array to hold cursor positions - mouse is first.
    }
    // Estimate a touch radius (in client pixels). Uses radiusX/radiusY when available,
    // falls back to touch.force or a sensible default.
    _estimateTouchRadius(touch) {
        const rx = touch.radiusX || 0;
        const ry = touch.radiusY || 0;
        if (rx || ry) return Math.max(rx, ry);
        if (touch.force) return Math.max(12, touch.force * 30);
        return 20; // default touch radius in pixels
    }
    addEvents(){
        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const r = this._estimateTouchRadius(touch);
                this.cursors.push({ id: touch.identifier, x: touch.clientX, y: touch.clientY, r });
            }
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];
                const cursor = this.cursors.find(c => c.id === touch.identifier);
                if (cursor) {
                    cursor.x = touch.clientX;
                    cursor.y = touch.clientY;
                    cursor.r = this._estimateTouchRadius(touch);
                }
            }
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const index = this.cursors.findIndex(c => c.id === touch.identifier);
                if (index !== -1) {
                    this.cursors.splice(index, 1);
                }
            }
        });
        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const mouseRadius = 12; // small cursor hit area for mouse
            if (this.cursors.length === 0) {
                this.cursors.push({ x: e.clientX, y: e.clientY, r: mouseRadius });
            } else {
                this.cursors[0].x = e.clientX;
                this.cursors[0].y = e.clientY;
                this.cursors[0].r = mouseRadius;
            }
        });
        this.canvas.addEventListener('mouseleave', (e) => {
            if (this.cursors.length > 0) {
                this.cursors.splice(0, 1);
            }
        });
    }
}