declare module 'seeded-rand' {
    export default class Srand {
        constructor(seed?: number);
        seed(): number;
        intInRange(min: number, max: number): number;
        floatInRange(min: number, max: number): number;
        random(): number;
    }
}
