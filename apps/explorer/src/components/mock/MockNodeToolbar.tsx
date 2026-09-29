"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FC } from "react";
import { isAddressEqual, isAddress } from "viem";
import {
    getHead,
    getPlaybackSpeed,
    isPlaying,
    pause,
    replay,
    reset,
    setSpeed,
    step,
    type ClockState,
} from "../../providers/mocknode/clock";
import {
    clockAtom,
    mockNodeStore,
    scenariosAtom,
} from "../../providers/mocknode/store";
import { pathBuilder } from "../../routes/routePathBuilder";
import { MockNodeControls } from "./MockNodeControls";

const options = { store: mockNodeStore };

const useNow = (interval: number) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), interval);
        return () => clearInterval(id);
    }, [interval]);
    return now;
};

/**
 * Play, pause, speed up or step the mock chain, and replay the scenario of
 * the application in view.
 */
export const MockNodeToolbar: FC = () => {
    const clock = useAtomValue(clockAtom, options);
    const setClock = useSetAtom(clockAtom, options);
    const scenarios = useAtomValue(scenariosAtom, options);
    const { application } = useParams<{ application?: string }>();
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const now = useNow(500);

    if (!clock) return null;

    const id = application ? decodeURIComponent(application) : undefined;
    const scenario = scenarios.find(
        (item) =>
            item.name === id ||
            (id !== undefined &&
                isAddress(id) &&
                isAddressEqual(item.address, id)),
    );

    const update = (
        change: (state: ClockState, now: number) => ClockState,
        rewind = false,
    ) => {
        setClock(change(clock, Date.now()));
        if (rewind) queryClient.invalidateQueries();
    };

    return (
        <MockNodeControls
            head={getHead(clock, now)}
            playing={isPlaying(clock)}
            speed={getPlaybackSpeed(clock)}
            replayable={scenario?.name}
            onPlay={() =>
                update((state, at) =>
                    setSpeed(state, at, getPlaybackSpeed(state)),
                )
            }
            onPause={() => update(pause)}
            onSpeedChange={(speed) =>
                update((state, at) => setSpeed(state, at, speed))
            }
            onStep={() => update(step)}
            onReplay={() => {
                if (!scenario || !application) return;
                update((state, at) => replay(state, at, scenario.name), true);
                const summary = pathBuilder.application({ application });
                if (pathname !== summary) router.push(summary);
            }}
            onReset={() =>
                update((state, at) => reset(state, at, scenarios), true)
            }
        />
    );
};
