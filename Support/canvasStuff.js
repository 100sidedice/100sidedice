export function resizeCanvas(canvasID = 'Draw') {
    const canvas = document.getElementById(canvasID);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
