import { notFound } from "next/navigation";
import { isHash } from "viem";
import { BondEventContainer } from "../../../../../../containers/BondEventContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/bonds/[txHash]/[logIndex]">,
) {
    const params = await props.params;
    if (!isHash(params.txHash) || !/^\d+$/.test(params.logIndex)) {
        return notFound();
    }

    return (
        <BondEventContainer
            application={params.application}
            txHash={params.txHash}
            logIndex={BigInt(params.logIndex)}
        />
    );
}
