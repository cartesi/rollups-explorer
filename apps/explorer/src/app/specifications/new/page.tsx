import type { Metadata } from "next";
import { NewSpecificationContainer } from "../../../containers/NewSpecificationContainer";

export const metadata: Metadata = {
    title: "New Specification",
};

export default function Page() {
    return <NewSpecificationContainer />;
}
