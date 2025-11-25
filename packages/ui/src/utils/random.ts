export const randomRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

export const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export const randomPick = <T>(array: T[]): T =>
    array[Math.floor(Math.random() * array.length)];

export const randomBool = (probability = 0.5) => Math.random() < probability;
