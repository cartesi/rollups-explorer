import { NextResponse } from "next/server";
import { getConfiguredCartesiNodeRpcUrl } from "../../../lib/getConfigCartesiNodeRpcUrl";
import { getConfiguredDebugEnabled } from "../../../lib/getConfigDebugEnabled";
import { getConfiguredIsContainer } from "../../../lib/getConfigIsContainer";
import { getConfiguredMockEnabled } from "../../../lib/getConfigMockEnabled";
import { getConfiguredNodeRpcUrl } from "../../../lib/getConfigNodeRpcUrl";

export async function GET() {
    if (!getConfiguredIsContainer()) {
        return new NextResponse(null, { status: 404, statusText: "Not Found" });
    }

    const cartesiNodeRpcUrl = getConfiguredCartesiNodeRpcUrl();
    const nodeRpcUrl = getConfiguredNodeRpcUrl();
    const isMockEnabled = getConfiguredMockEnabled();
    const isDebugEnabled = getConfiguredDebugEnabled();

    return NextResponse.json({
        cartesiNodeRpcUrl,
        nodeRpcUrl,
        isMockEnabled,
        isDebugEnabled,
    });
}
