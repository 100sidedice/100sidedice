export function resizeCanvas(canvasID = 'Draw') {
    const canvas = document.getElementById(canvasID);
    const viewport = window.visualViewport;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
}
