import type { Engine } from "@/app/_engine/core/Engine";

export type ChoosingAction =
    | { type: "select"; index: number }
    | { type: "confirm" }
    | { type: "none" };

export function readChoosingInput(
    input: Engine["input"],
    currentIndex: number,
    movesLength: number
): ChoosingAction {
    if (movesLength <= 0) return { type: "none" };
    if (input.justPressed("up") || input.justPressed("left")) {
        return { type: "select", index: (currentIndex - 1 + movesLength) % movesLength };
    }
    if (input.justPressed("down") || input.justPressed("right")) {
        return { type: "select", index: (currentIndex + 1) % movesLength };
    }
    if (input.justPressed("confirm")) {
        return { type: "confirm" };
    }
    return { type: "none" };
}