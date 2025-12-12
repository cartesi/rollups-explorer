"use client";
import dynamic from "next/dynamic";
import { ComponentType, ReactNode } from "react";

export const Shell: ComponentType<{ children: ReactNode }> = dynamic(
    () => import("./shell"),
    {
        ssr: false,
    },
);
