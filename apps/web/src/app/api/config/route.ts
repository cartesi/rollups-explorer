import { NextResponse } from "next/server";
import { getConfiguredPublicExplorerAPI } from "../../../lib/getConfigExplorerAPIUrl";
import { getConfiguredIsContainer } from "../../../lib/getConfigIsContainer";
import { getConfiguredNodeRpcUrl } from "../../../lib/getConfigNodeRpcUrl";

export async function GET() {
    if (!getConfiguredIsContainer()) {
        return new NextResponse(null, { status: 404, statusText: "Not Found" });
    }

    const apiEndpoint = getConfiguredPublicExplorerAPI();
    const nodeRpcUrl = getConfiguredNodeRpcUrl();
    return NextResponse.json({ apiEndpoint, nodeRpcUrl });
}
