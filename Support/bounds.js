export function checkBounds(ctx, x, y){
    const canvas = ctx.canvas
    const rect = canvas.getBoundingClientRect()
    if(x < rect.left || x > rect.right || y < rect.top || y > rect.bottom){
        return false
    }
    return true
}