export const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export const lerp = (start: number, end: number, t: number) =>
    start * (1 - t) + end * t;

export const mapRange = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const toDegrees = (radians: number) => (radians * 180) / Math.PI;
