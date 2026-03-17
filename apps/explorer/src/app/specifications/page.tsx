import type { Metadata } from "next";
import { SpecificationsContainer } from "../../containers/SpecificationsContainer";

export const metadata: Metadata = {
    title: "Specifications",
};

export default function Page() {
    return <SpecificationsContainer />;
}
