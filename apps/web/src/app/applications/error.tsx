"use client";

import type { FC } from "react";
import PageError from "../../components/pageError";

interface PageErrorProps {
    reset: () => void;
}

const Error: FC<PageErrorProps> = ({ reset }) => <PageError reset={reset} />;

export default Error;
