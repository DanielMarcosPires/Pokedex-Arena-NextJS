export interface BattleStep {
    duration: number;
    execute: () => void;
}

export interface TurnQueueCallbacks {
    isBlocked: () => boolean;
    onQueueEmpty: () => void;
    onTurnEndedAfterSwitch: () => void;
    onAfterStepExecuted?: () => void;
}

export class TurnQueue {
    private queue: BattleStep[] = [];
    private timer = 0;
    private endTurnAfterFaintSwitch = false;

    get isActive(): boolean {
        return this.timer > 0 || this.queue.length > 0;
    }

    reset(): void {
        this.queue = [];
        this.timer = 0;
        this.endTurnAfterFaintSwitch = false;
    }

    setSteps(steps: BattleStep[], autoStart = true): void {
        this.queue = [...steps];
        this.timer = 0;
        this.endTurnAfterFaintSwitch = false;
        if (autoStart) {
            this.runNext();
        }
    }

    markEndTurnAfterFaintSwitch(): void {
        this.queue = [];
        this.timer = 0;
        this.endTurnAfterFaintSwitch = true;
    }

    update(dt: number, callbacks: TurnQueueCallbacks): void {
        if (callbacks.isBlocked()) return;

        if (this.timer > 0) {
            this.timer = Math.max(0, this.timer - dt);
            if (this.timer === 0) {
                this.runNext(callbacks);
            }
        }
    }

    runNext(callbacks?: TurnQueueCallbacks): void {
        if (callbacks?.isBlocked()) return;

        if (this.endTurnAfterFaintSwitch) {
            this.endTurnAfterFaintSwitch = false;
            this.queue = [];
            this.timer = 0;
            callbacks?.onTurnEndedAfterSwitch();
            return;
        }

        const next = this.queue.shift();
        if (!next) {
            callbacks?.onQueueEmpty();
            return;
        }

        next.execute();

        if (callbacks?.isBlocked()) return;

        this.timer = next.duration;
        callbacks?.onAfterStepExecuted?.();
    }
}