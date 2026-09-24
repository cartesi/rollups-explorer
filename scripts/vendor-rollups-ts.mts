/**
 * Build rollups-ts, pack the selected packages and place them in explorer's
 * vendor/ folder under stable names (e.g. vendor/cartesi-client.tgz).
 *
 * Usage (from explorer's root):
 *   node scripts/vendor-rollups-ts.mts <path-to-rollups-ts> [package ...]
 *
 * Examples:
 *   node scripts/vendor-rollups-ts.mts ../rollups-ts
 *   node scripts/vendor-rollups-ts.mts ../rollups-ts client react
 *
 * Runs natively on Node 24 (type stripping), no build step or dependencies.
 */
import { execFileSync } from "node:child_process";
import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    renameSync,
    rmSync,
} from "node:fs";
import { join, resolve } from "node:path";

const DEFAULT_PACKAGES = ["client", "react", "rpc", "codec"];

const explorerRoot = resolve(import.meta.dirname, "..");
const vendorDir = join(explorerRoot, "vendor");
const tmpDir = join(vendorDir, ".pack-tmp");
const isWindows = process.platform === "win32";

function fail(message: string): never {
    console.error(`error: ${message}`);
    process.exit(1);
}

function run(cmd: string, args: string[], cwd: string): void {
    execFileSync(cmd, args, { cwd, stdio: "inherit", shell: isWindows });
}

function capture(cmd: string, args: string[], cwd: string): string {
    return execFileSync(cmd, args, {
        cwd,
        encoding: "utf8",
        shell: isWindows,
    }).trim();
}

// --- arguments & validation ------------------------------------------------

const args = process.argv.slice(2);
if (args[0] === "--") args.shift(); // e.g. `pnpm vendor:rollups-ts -- ../rollups-ts`
const [rollupsTsArg, ...packageArgs] = args;
if (!rollupsTsArg) {
    fail(
        "usage: node scripts/vendor-rollups-ts.mts <path-to-rollups-ts> [package ...]",
    );
}

const rollupsTs = resolve(rollupsTsArg);
if (
    !existsSync(join(rollupsTs, "pnpm-workspace.yaml")) ||
    !existsSync(join(rollupsTs, "packages"))
) {
    fail(
        `${rollupsTs} does not look like the rollups-ts root (no pnpm-workspace.yaml or packages/)`,
    );
}

const packages = packageArgs.length > 0 ? packageArgs : DEFAULT_PACKAGES;
const selected = packages.map((p) => {
    const dir = join(rollupsTs, "packages", p);
    const manifest = join(dir, "package.json");
    if (!existsSync(manifest)) {
        fail(`package "${p}" not found at ${dir}`);
    }
    const { name } = JSON.parse(readFileSync(manifest, "utf8")) as {
        name: string;
    };
    return { dir, name };
});

// --- build -----------------------------------------------------------------

// "<name>..." selects the package plus the workspace packages it depends on,
// and pnpm runs their builds in dependency order. Nothing else is built.
const filters = selected.flatMap(({ name }) => ["--filter", `${name}...`]);
console.log(
    `\n> Building ${selected.map((s) => s.name).join(", ")} (and their workspace dependencies)\n`,
);
run("pnpm", [...filters, "run", "--if-present", "build"], rollupsTs);

// --- pack & vendor ---------------------------------------------------------

mkdirSync(vendorDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
mkdirSync(tmpDir, { recursive: true });

const vendored: string[] = [];
try {
    for (const { dir, name } of selected) {
        console.log(`\n> Packing ${name}`);
        run("pnpm", ["pack", "--pack-destination", tmpDir], dir);

        const tarball = readdirSync(tmpDir).find((f) => f.endsWith(".tgz"));
        if (!tarball) {
            fail(`pnpm pack produced no tarball for ${name}`);
        }

        // @cartesi/client -> cartesi-client.tgz (stable, version-free name)
        const target = `${name.replace(/^@/, "").replace("/", "-")}.tgz`;
        renameSync(join(tmpDir, tarball), join(vendorDir, target));
        vendored.push(`${name} -> vendor/${target}`);
    }
} finally {
    rmSync(tmpDir, { recursive: true, force: true });
}

// --- summary ---------------------------------------------------------------

let source = "unknown commit";
try {
    const branch = capture(
        "git",
        ["rev-parse", "--abbrev-ref", "HEAD"],
        rollupsTs,
    );
    const sha = capture("git", ["rev-parse", "--short", "HEAD"], rollupsTs);
    const dirty = capture("git", ["status", "--porcelain"], rollupsTs) !== "";
    source = `${branch}@${sha}${dirty ? " (with uncommitted changes)" : ""}`;
} catch {
    // not a git checkout; keep "unknown commit"
}

console.log(`\nVendored from rollups-ts ${source}:`);
for (const line of vendored) console.log(`  ${line}`);
console.log(
    "\nNext: pnpm install, then commit vendor/, pnpm-workspace.yaml and pnpm-lock.yaml.",
);
