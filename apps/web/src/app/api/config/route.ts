import { NextResponse } from "next/server";
import { getConfiguredPublicExplorerAPI } from "../../../lib/getConfigExplorerAPIUrl";
import { getConfiguredIsContainer } from "../../../lib/getConfigIsContainer";
import { getConfiguredNodeRpcUrl } from "../../../lib/getConfigNodeRpcUrl";
import getConfiguredChainId from "../../../lib/getConfiguredChain";

export async function GET() {
    if (!getConfiguredIsContainer()) {
        return new NextResponse(null, { status: 404, statusText: "Not Found" });
    }

    const apiEndpoint = getConfiguredPublicExplorerAPI();
    const nodeRpcUrl = getConfiguredNodeRpcUrl();
    const chainId = getConfiguredChainId();
    return NextResponse.json({ apiEndpoint, nodeRpcUrl, chainId });
}
