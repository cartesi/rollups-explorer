const queries = [
    {
        queryKey: [
            "epochs",
            {
                application: "AppOne",
                descending: true,
            },
        ],
        data: {
            data: [
                {
                    index: "$bigint:0",
                    firstBlock: "$bigint:3",
                    lastBlock: "$bigint:31",
                    inputIndexLowerBound: "$bigint:0",
                    inputIndexUpperBound: "$bigint:1",
                    tournamentAddress:
                        "0xA2835312696Afa86c969e40831857dbB1412627f",
                    commitment:
                        "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    claimHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    claimTransactionHash:
                        "0xd6dcb8aafbdc19a690c242625c45e2e5d0cbe6369905ae3447df7b6005478d30",
                    status: "CLAIM_COMPUTED",
                    virtualIndex: "$bigint:0",
                    createdAt: "2025-12-19T17:42:59.415Z",
                    updatedAt: "2025-12-19T17:43:05.977Z",
                },
            ],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 1,
            },
        },
    },
    {
        queryKey: [
            "epoch",
            {
                application: "AppOne",
                descending: true,
                epochIndex: "0",
            },
        ],
        data: {
            index: "$bigint:0",
            firstBlock: "$bigint:3",
            lastBlock: "$bigint:31",
            inputIndexLowerBound: "$bigint:0",
            inputIndexUpperBound: "$bigint:1",
            tournamentAddress: "0xA2835312696Afa86c969e40831857dbB1412627f",
            commitment:
                "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
            machineHash:
                "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
            claimHash:
                "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
            claimTransactionHash:
                "0xd6dcb8aafbdc19a690c242625c45e2e5d0cbe6369905ae3447df7b6005478d30",
            status: "CLAIM_COMPUTED",
            virtualIndex: "$bigint:0",
            createdAt: "2025-12-19T17:42:59.415Z",
            updatedAt: "2025-12-19T17:43:05.977Z",
        },
    },
    {
        queryKey: [
            "inputs",
            {
                application: "AppOne",
                descending: true,
                epochIndex: "0",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:0",
                    blockNumber: "$bigint:30",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000006913842881e82fe3a953ef3dc195c50a67f1832a974aaeab36949756a12b049d410b587400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:30",
                        blockTimestamp: "$bigint:1762886696",
                        prevRandao:
                            "$bigint:58758596506088447821708439158807873933211981809931283591188605962205887420532",
                        index: "$bigint:0",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0x80819de6c5f385a58a46fa41ae90f9e4e35230e274a4a0fc50f78cc817da13aa",
                    createdAt: "2025-12-19T17:42:59.415Z",
                    updatedAt: "2025-12-19T17:42:59.988Z",
                },
            ],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 1,
            },
        },
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppOne",
                address: "0xA2835312696Afa86c969e40831857dbB1412627f",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            address: "0xA2835312696Afa86c969e40831857dbB1412627f",
            parentTournamentAddress: null,
            parentMatchIdHash: null,
            maxLevel: "$bigint:3",
            level: "$bigint:0",
            log2step: "$bigint:44",
            height: "$bigint:48",
            winnerCommitment: null,
            finalStateHash: null,
            finishedAtBlock: "$bigint:331",
            createdAt: "2025-12-19T17:43:05.969Z",
            updatedAt: "2025-12-19T17:43:05.969Z",
        },
    },
    {
        queryKey: [
            "matches",
            {
                application: "AppOne",
                epochIndex: "0",
                tournamentAddress: "0xA2835312696Afa86c969e40831857dbB1412627f",
            },
        ],
        data: {
            data: [],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 0,
            },
        },
    },
    {
        queryKey: [
            "commitments",
            {
                application: "AppOne",
                epochIndex: "0",
                tournamentAddress: "0xA2835312696Afa86c969e40831857dbB1412627f",
            },
        ],
        data: {
            data: [],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 0,
            },
        },
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppOne",
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppOne",
                epochIndex: "0",
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppOne",
                address: null,
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppOne",
                epochIndex: "0",
                tournamentAddress: null,
                idHash: null,
                enabled: false,
            },
        ],
    },
];

export default queries;
