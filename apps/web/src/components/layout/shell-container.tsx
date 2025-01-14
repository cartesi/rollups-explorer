"use client";
import dynamic from "next/dynamic";

export const Shell = dynamic(() => import("./shell"), {
    ssr: false,
});
