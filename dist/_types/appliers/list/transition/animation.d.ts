type AnimationRecord = {
    startTime: number;
    duration: number;
    cb: (t: number) => void;
    done: (success: boolean) => void;
};
export declare class AnimationSystem {
    activeAnimations: Map<string, AnimationRecord>;
    frameId?: number;
    start(): void;
    add<R>(duration: number, id: string, tick: (t: number) => Promise<R>): Promise<boolean>;
    cancel(key: string): void;
    stop(): void;
}
export {};
//# sourceMappingURL=animation.d.ts.map