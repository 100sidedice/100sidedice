export function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

export function loadSave(key, fallback = null) {
    const rawValue = localStorage.getItem(key)

    if (rawValue === null) {
        return fallback
    }

    try {
        return JSON.parse(rawValue)
    } catch {
        return fallback
    }
}

export function hasSave(key) {
    return localStorage.getItem(key) !== null
}

export function removeSave(key) {
    localStorage.removeItem(key)
}