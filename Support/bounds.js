export function checkBounds(x, y, size, width = window.innerWidth, height = window.innerHeight){
    if(x + size < 0 || x - size > width || y + size < 0 || y - size > height){
        return false
    }
    return true
}