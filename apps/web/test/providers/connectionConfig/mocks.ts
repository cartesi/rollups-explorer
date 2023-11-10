import { Address } from "viem";
import { Connection } from "../../../src/providers/connectionConfig/types";

const connections: Connection[] = [
    {
        address: "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
        url: "http://localhost:3000",
        timestamp: 1,
    },
    {
        address: "0xC0bF2492b753C10eB3C7f584f8F5C667e1e5a3f5",
        url: "https://my-custom-api.host/",
        timestamp: 2,
    },
];

const address: Address = "0xfA18D9738D906813FE81aAdE5BB2739207162305";

export { address, connections };
