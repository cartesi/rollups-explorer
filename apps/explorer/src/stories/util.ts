import type { Match, Tournament, WinnerCommitment } from "@cartesi/viem";
import {
    concat,
    encodeAbiParameters,
    hexToNumber,
    keccak256,
    numberToHex,
    slice,
    toBytes,
    type Address,
    type Hash,
    type Hex,
} from "viem";
import type { Claim } from "../components/types";

/**
 * Create a pseudo-random number generator from a seed
 * @param seed seed for the generator
 * @returns pseudo-random number generator
 */
export function mulberry32(seed: number) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Create a claim with a hash and parent claims
 * @param i number to generate hash from
 * @param args numbers to generate parent claims from
 * @returns claim with a hash and parent claims
 */
export const claim = (i: number, ...args: number[]): Claim => ({
    hash: keccak256(toBytes(i)),
    parentClaims: args.map((i) => keccak256(toBytes(i))),
});

/**
 * Return a number between 0 and 1 from a hex value.
 * @param value hex value with arbitrary length
 * @returns number between 0 and 1
 */
const hexToFraction = (value: Hex): number => {
    const l = slice(value, 0, 1);
    const n = hexToNumber(l);
    return n / 256;
};

/**
 * Generate a random winner for a match, 20% chance of undefined, 40% chance of 1, 40% chance of 2
 * @returns
 */
const randomWinner = (claim1: Hash, claim2: Hash): WinnerCommitment => {
    const r = hexToFraction(keccak256(concat([claim1, claim2])));
    if (r < 0.2) return "NONE";
    if (r < 0.6) return "ONE";
    return "TWO";
};

/**
 * Create a pseudo-random list of ranges that bisect the given range n times
 * @param range range to bisect
 * @param n number of ranges to create
 * @returns list of ranges
 */
export const randomBisections = (n: number, seed: number = 0): (0 | 1)[] => {
    // initialize the random number generator
    const rand = mulberry32(seed);

    // initialize the list of ranges
    const ranges: (0 | 1)[] = [];

    // create the ranges
    for (let i = 0; i < n; i++) {
        // choose a random direction to bisect the range
        if (rand() < 0.5) {
            ranges.push(0);
        } else {
            ranges.push(1);
        }
    }
    // remove the first range, which is the original range
    return ranges;
};

/**
 * A match has an id, check [solidity code reference]{@link https://github.com/cartesi/dave/blob/feat/experiment-dave-ui/prt/contracts/src/tournament/abstracts/Tournament.sol#L350}
 * This function is a reference implementation from this [solidity struct ID]{@link https://github.com/cartesi/dave/blob/feat/experiment-dave-ui/prt/contracts/src/tournament/libs/Match.sol#L40}
 * used on dave PRT's solidity contracts.
 * @param claimOne  claim1 hash
 * @param claimTwo  claim2 hash
 * @returns {Hex}
 */
export const generateMatchID = (claimOne: Hex, claimTwo: Hex) => {
    const abiEncodedClaims = encodeAbiParameters(
        [{ type: "bytes32" }, { type: "bytes32" }],
        [claimOne, claimTwo],
    );

    return keccak256(abiEncodedClaims);
};

export const generateTournamentAddress = (n1: number, n2: number): Address => {
    //xxx handy cheat here...
    return slice(
        generateMatchID(
            numberToHex(n1, { size: 32 }),
            numberToHex(n2, { size: 32 }),
        ),
        0,
        20,
    );
};

/**
 * Create matches for a tournament
 * @param tournament Tournament to create matches for
 * @param claims Claims to create matches for
 * @returns Tournament with matches
 */
export const randomMatches = (
    timestamp: number,
    tournament: Tournament,
    claims: Hash[],
): Match[] => {
    const rng = mulberry32(0);

    const matches: Match[] = [];
    let danglingClaim: Hash | undefined = undefined;
    let claim = claims.shift();
    while (claim) {
        if (danglingClaim) {
            // create a match with the dangling claim
            const claim1 = danglingClaim;
            matches.push({
                idHash: generateMatchID(claim1, claim),
                commitmentOne: claim1,
                commitmentTwo: claim,
                blockNumber: 1n,
                createdAt: new Date(timestamp),
                deletionBlockNumber: null,
                deletionReason: "NOT_DELETED",
                deletionTxHash: null,
                epochIndex: 0n,
                leftOfTwo:
                    "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                tournamentAddress: tournament.address,
                txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                updatedAt: new Date(timestamp),
                winnerCommitment: "NONE",
            });
            danglingClaim = undefined;
            timestamp++; // XXX: improve this timestamp increment
        } else {
            // assign the claim to the dangling slot
            danglingClaim = claim;
        }

        // get pending matches (without a winner) and pick one randomlly
        const pending = matches.filter(
            (match) => match.winnerCommitment === "NONE",
        );
        const match = pending[Math.floor(rng() * pending.length)];
        if (match) {
            // resolve a winner randomly
            const winner = randomWinner(
                match.commitmentOne,
                match.commitmentTwo,
            );
            match.winnerCommitment = winner;
            if (winner !== "NONE") {
                // assign the winner, and put the claim back to the list
                match.updatedAt = new Date(timestamp);
                timestamp++; // XXX: improve this timestamp incrementation
                claims.unshift(
                    winner === "ONE"
                        ? match.commitmentOne
                        : match.commitmentTwo,
                );
            }
        }

        claim = claims.shift();
    }

    // define tournament winner
    const pending = matches.filter(
        (match) => match.winnerCommitment === "NONE",
    );
    if (pending.length === 0) {
        // all matches are resolved, the winner is the last surviving claim
        const lastMatch = matches[matches.length - 1];
        tournament.winnerCommitment =
            lastMatch.winnerCommitment === "ONE"
                ? lastMatch.commitmentOne
                : lastMatch.commitmentTwo;
    }

    return matches;
};
