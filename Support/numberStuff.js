export function capSigFig(num, sig) {
    if (num === 0) return 0; // Handle zero as a special case
    const absNum = Math.abs(num);
    const sciThreshold = 1000000;

    if (absNum >= sciThreshold) {
        const precision = Math.max(0, sig - 1);
        return Number(num).toExponential(precision).replace('e+', 'e');
    }

    const multiplier = Math.pow(10, sig - Math.ceil(Math.log10(Math.abs(num))));
    return Math.round(num * multiplier) / multiplier;
}