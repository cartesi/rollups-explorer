import { ImageProps } from "next/image";

export interface IconProps
    extends Omit<ImageProps, "src" | "width" | "height" | "alt"> {
    size?: number;
    id?: string;
}
