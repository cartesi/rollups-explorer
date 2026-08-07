import { WithdrawalsContainer } from "../../../../containers/WithdrawalsContainer";

export default async function Page(
    props: PageProps<"/apps/[application]/withdrawals">,
) {
    const params = await props.params;
    return <WithdrawalsContainer application={params.application} />;
}
