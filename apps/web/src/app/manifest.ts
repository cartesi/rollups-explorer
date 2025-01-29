import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "CartesiScan",
        short_name: "CS",
        description:
            "Scan DApp inputs and interact with DApp's backend at ease.",
        start_url: "/",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#00f7ff",
        icons: [
            {
                src: "cartesi-logo-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "cartesi-logo-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "maskable-icon-196x196.png",
                sizes: "196x196",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
