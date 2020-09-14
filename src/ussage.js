export function importAll(r) {
    return r.keys().map(r);
}

export function minmax(x, minnum, maxnum) {
    return Math.max(minnum, Math.min(maxnum, x));
}

export function scale(x, frommin, frommax, tomin, tomax) {
    return (x-frommin)/(frommax-frommin) * (tomax-tomin) + tomin;
}