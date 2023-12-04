"use client";

import type { FC } from "react";

interface PageErrorProps {
    reset: () => void;
}

const PageError: FC<PageErrorProps> = ({ reset }) => (
    <PageError reset={reset} />
);

export default PageError;
