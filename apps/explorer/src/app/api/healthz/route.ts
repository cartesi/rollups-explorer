import { NextResponse } from "next/server";

/**
 * This endpoint is used for health checks and should not be cached,
 * as it provides real-time information about the application's status.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

type HealthzResponse = {
    status: string;
    timestamp: string;
    uptimeSeconds?: number;
};

export function GET() {
    const response: HealthzResponse = {
        status: "ok",
        timestamp: new Date().toISOString(),
    };

    const HEALTHZ_UPTIME_ENABLED =
        process.env.HEALTHZ_UPTIME_ENABLED ?? "false";

    const isUptimeEnabled = HEALTHZ_UPTIME_ENABLED.toLowerCase() === "true";

    if (isUptimeEnabled) {
        // Calculate uptime in seconds. Better suited for long running server environments.
        // In serverless environments, this represents
        // the lifetime of the current function instance, not the entire application.
        response.uptimeSeconds = Math.floor(process.uptime());
    }

    return NextResponse.json(response, {
        status: 200,
        headers: {
            "Cache-Control": "no-store",
        },
    });
}
