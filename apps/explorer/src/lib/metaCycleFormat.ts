import { content } from "../content";
import {
    LAST_INPUT,
    MCYCLE_MASK,
    UCYCLE_MASK,
    decomposeMetaCycle,
    getMetaSpan,
} from "./prtUtils";

const text = content.tournament.cycle;
const number = new Intl.NumberFormat("en-US");
const format = (value: bigint) => number.format(value);

/**
 * Format one meta-cycle as its input, mcycle and, when not zero, ucycle.
 */
export const formatMetaCycle = (metaCycle: bigint) => {
    const { input, mcycle, ucycle } = decomposeMetaCycle(metaCycle);
    const base = `${text.inputTxt} #${format(input)} · ${text.mcycleTxt} ${format(mcycle)}`;
    return ucycle === 0n
        ? base
        : `${base} · ${text.ucycleTxt} ${format(ucycle)}`;
};

/**
 * Format a half-open meta-cycle range `[start, end)` with an inclusive end,
 * writing the parts both ends share only once.
 */
export const formatMetaCycleRange = ([start, end]: [bigint, bigint]) => {
    const last = end > start ? end - 1n : start;
    const first = decomposeMetaCycle(start);
    const final = decomposeMetaCycle(last);
    const startsInput = first.mcycle === 0n && first.ucycle === 0n;
    const endsInput =
        final.mcycle === MCYCLE_MASK && final.ucycle === UCYCLE_MASK;
    const input = `${text.inputTxt} #${format(first.input)}`;

    if (startsInput && endsInput) {
        if (first.input === final.input) {
            return `${input} · ${text.wholeInputTxt}`;
        }
        const range = `${input} – #${format(final.input)}`;
        return first.input === 0n && final.input === LAST_INPUT
            ? `${range} · ${text.wholeEpochTxt}`
            : range;
    }

    if (first.input !== final.input) {
        return `${formatMetaCycle(start)} – ${formatMetaCycle(last)}`;
    }

    if (first.ucycle === 0n && final.ucycle === UCYCLE_MASK) {
        return `${input} · ${text.mcycleTxt} ${format(first.mcycle)} – ${format(final.mcycle)}`;
    }

    if (first.mcycle === final.mcycle) {
        return `${input} · ${text.mcycleTxt} ${format(first.mcycle)} · ${text.ucycleTxt} ${format(first.ucycle)} – ${format(final.ucycle)}`;
    }

    return `${input} · ${text.mcycleTxt} ${format(first.mcycle)} · ${text.ucycleTxt} ${format(first.ucycle)} – ${text.mcycleTxt} ${format(final.mcycle)} · ${text.ucycleTxt} ${format(final.ucycle)}`;
};

/**
 * Format a span of `2^log2` meta-cycles in its largest whole unit.
 */
export const formatMetaSpan = (log2: bigint) => {
    const { count, unit } = getMetaSpan(log2);
    const label = count === 1n ? text.unit[unit] : text.unit[`${unit}s`];
    return `${format(count)} ${label}`;
};
