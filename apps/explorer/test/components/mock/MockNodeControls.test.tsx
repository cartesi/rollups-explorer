import { describe, expect, it, vi } from "vitest";
import { MockNodeControls } from "../../../src/components/mock/MockNodeControls";
import { content } from "../../../src/content";
import { fireEvent, render, screen } from "../../test-utils";

const text = content.mock;

const setup = (props: Partial<Parameters<typeof MockNodeControls>[0]> = {}) => {
    const handlers = {
        onPlay: vi.fn(),
        onPause: vi.fn(),
        onSpeedChange: vi.fn(),
        onStep: vi.fn(),
        onReplay: vi.fn(),
        onReset: vi.fn(),
    };
    render(
        <MockNodeControls
            head={25_012n}
            playing
            speed={1}
            {...handlers}
            {...props}
        />,
    );
    return handlers;
};

describe("MockNodeControls", () => {
    it("should show the head block", () => {
        setup();
        expect(screen.getByText(`${text.blockTxt} 25,012`)).toBeInTheDocument();
    });

    it("should pause while playing and play while paused", () => {
        const playing = setup();
        fireEvent.click(screen.getByRole("button", { name: text.pauseTxt }));
        expect(playing.onPause).toHaveBeenCalled();
        expect(
            screen.queryByRole("button", { name: text.playTxt }),
        ).not.toBeInTheDocument();
    });

    it("should play when paused", () => {
        const paused = setup({ playing: false });
        fireEvent.click(screen.getByRole("button", { name: text.playTxt }));
        expect(paused.onPlay).toHaveBeenCalled();
    });

    it("should play at the last speed picked while paused", () => {
        const paused = setup({ playing: false, speed: 60 });
        fireEvent.click(screen.getByText("60×"));
        expect(paused.onSpeedChange).toHaveBeenCalledWith(60);
    });

    it("should step, change the speed and reset", () => {
        const handlers = setup();
        fireEvent.click(screen.getByRole("button", { name: text.stepTxt }));
        fireEvent.click(screen.getByText("60×"));
        fireEvent.click(screen.getByRole("button", { name: text.resetTxt }));
        expect(handlers.onStep).toHaveBeenCalled();
        expect(handlers.onSpeedChange).toHaveBeenCalledWith(60);
        expect(handlers.onReset).toHaveBeenCalled();
    });

    it("should only offer a replay for a scenario in view", () => {
        setup();
        expect(
            screen.queryByRole("button", { name: text.replayTxt }),
        ).not.toBeInTheDocument();
    });

    it("should replay the scenario in view", () => {
        const handlers = setup({ replayable: "AppNine" });
        fireEvent.click(screen.getByRole("button", { name: text.replayTxt }));
        expect(handlers.onReplay).toHaveBeenCalled();
    });
});
