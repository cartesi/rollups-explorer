const queries = [
    {
        queryKey: [
            "epochs",
            {
                application: "AppFive",
                descending: true,
            },
        ],
        data: {
            data: [
                {
                    index: "$bigint:0",
                    firstBlock: "$bigint:1111",
                    lastBlock: "$bigint:1505",
                    inputIndexLowerBound: "$bigint:10",
                    inputIndexUpperBound: "$bigint:10",
                    tournamentAddress:
                        "0x3fd36d25c4515B8bE331DE689A5e65D2318DdeA3",
                    commitment:
                        "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    claimHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    claimTransactionHash: null,
                    status: "CLAIM_COMPUTED",
                    virtualIndex: "$bigint:4",
                    createdAt: "2026-01-09T12:35:03.788Z",
                    updatedAt: "2026-01-09T12:35:08.813Z",
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
                application: "AppFive",
                descending: true,
                epochIndex: "0",
            },
        ],
        data: {
            index: "$bigint:0",
            firstBlock: "$bigint:728",
            lastBlock: "$bigint:1111",
            inputIndexLowerBound: "$bigint:7",
            inputIndexUpperBound: "$bigint:10",
            tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            commitment:
                "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
            machineHash:
                "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
            claimHash:
                "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
            claimTransactionHash:
                "0x59ec08bd457a7df7501f9fa50719d5eddb2cf5e4089fffe5abaa5791c4833d90",
            status: "CLAIM_ACCEPTED",
            virtualIndex: "$bigint:0",
            createdAt: "2026-01-09T12:35:03.783Z",
            updatedAt: "2026-01-09T12:35:11.981Z",
        },
    },
    {
        queryKey: [
            "inputs",
            {
                application: "AppFive",
                descending: true,
                epochIndex: "0",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:9",
                    blockNumber: "$bigint:836",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000034400000000000000000000000000000000000000000000000000000000691385d329b17467fd1e2b37e13b1444ffcb6e7dc8efc8569289ed8238e562f92141f9ab00000000000000000000000000000000000000000000000000000000000000090000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:836",
                        blockTimestamp: "$bigint:1762887123",
                        prevRandao:
                            "$bigint:18858362128486850896981793978705427656546172914990851142476725843170219391403",
                        index: "$bigint:9",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0xdc16f04b75dc643a4b2ee4b6cb297d82ba54c0443cc11a4b2939c26d86ba4a46",
                    createdAt: "2026-01-09T12:35:03.783Z",
                    updatedAt: "2026-01-09T12:35:05.916Z",
                },
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:8",
                    blockNumber: "$bigint:835",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000034300000000000000000000000000000000000000000000000000000000691385d3be55c9b08494f4ebdc165ced89a87184a9aa2572e622fd35faeb63c7309dc1ae00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:835",
                        blockTimestamp: "$bigint:1762887123",
                        prevRandao:
                            "$bigint:86091015241255594523048715501868760928503729114035859233961744657850992279982",
                        index: "$bigint:8",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0x5cfd878b34a675a04cf0299402c6aa64fc214008d970770b918567d8e60ad36b",
                    createdAt: "2026-01-09T12:35:03.783Z",
                    updatedAt: "2026-01-09T12:35:05.907Z",
                },
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:7",
                    blockNumber: "$bigint:834",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000034200000000000000000000000000000000000000000000000000000000691385d319bfb18501e42a6389387886a8c50f066cb3ebd88aaa95d6ac1f2ed19f7fe29c00000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:834",
                        blockTimestamp: "$bigint:1762887123",
                        prevRandao:
                            "$bigint:11646514198929793944740418135977007399552759175391296470616300755668432839324",
                        index: "$bigint:7",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0xa478e4272cfba4fe926ff32f1e7ddd640a848695db80b8c836988ddd61f1d817",
                    createdAt: "2026-01-09T12:35:03.783Z",
                    updatedAt: "2026-01-09T12:35:05.894Z",
                },
            ],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 3,
            },
        },
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppFive",
                address: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            address: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            parentTournamentAddress: null,
            parentMatchIdHash: null,
            maxLevel: "$bigint:3",
            level: "$bigint:0",
            log2step: "$bigint:44",
            height: "$bigint:48",
            winnerCommitment:
                "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
            finalStateHash:
                "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
            finishedAtBlock: "$bigint:1504",
            createdAt: "2026-01-09T12:35:11.927Z",
            updatedAt: "2026-01-09T12:35:11.927Z",
        },
    },
    {
        queryKey: [
            "matches",
            {
                application: "AppFive",
                epochIndex: "0",
                tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    commitmentOne:
                        "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
                    commitmentTwo:
                        "0xc8b7a301e8263edba07d0eee2feb66c1caa04b48b82d338d231d4d5d54ca3e0d",
                    leftOfTwo:
                        "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                    blockNumber: "$bigint:1133",
                    txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                    winnerCommitment: "ONE",
                    deletionReason: "TIMEOUT",
                    deletionBlockNumber: "$bigint:1504",
                    deletionTxHash:
                        "0x270ff512ce6282fc112d18e8acea1afca630aa3f33f947592e42e8b002b70f0f",
                    createdAt: "2026-01-09T12:35:11.930Z",
                    updatedAt: "2026-01-09T12:35:11.953Z",
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
            "commitments",
            {
                application: "AppFive",
                epochIndex: "0",
                tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    commitment:
                        "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
                    finalStateHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    submitterAddress:
                        "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
                    blockNumber: "$bigint:1128",
                    txHash: "0x9a6161d38a550939dc497715ee57a1d99197ee9ba24af5937c45783d7d761430",
                    createdAt: "2026-01-09T12:35:11.929Z",
                    updatedAt: "2026-01-09T12:35:11.929Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    commitment:
                        "0xc8b7a301e8263edba07d0eee2feb66c1caa04b48b82d338d231d4d5d54ca3e0d",
                    finalStateHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    submitterAddress:
                        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    blockNumber: "$bigint:1133",
                    txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
                    createdAt: "2026-01-09T12:35:11.930Z",
                    updatedAt: "2026-01-09T12:35:11.930Z",
                },
            ],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 2,
            },
        },
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppFive",
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppFive",
                epochIndex: "0",
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppFive",
                address: null,
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppFive",
                epochIndex: "0",
                tournamentAddress: null,
                idHash: null,
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppFive",
                epochIndex: "0",
                tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
            commitmentOne:
                "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
            commitmentTwo:
                "0xc8b7a301e8263edba07d0eee2feb66c1caa04b48b82d338d231d4d5d54ca3e0d",
            leftOfTwo:
                "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
            blockNumber: "$bigint:1133",
            txHash: "0x06ad8f0ce427010498fbb2388b432f6d578e4e1ffe5dbf20869629b09dcf0d70",
            winnerCommitment: "ONE",
            deletionReason: "TIMEOUT",
            deletionBlockNumber: "$bigint:1504",
            deletionTxHash:
                "0x270ff512ce6282fc112d18e8acea1afca630aa3f33f947592e42e8b002b70f0f",
            createdAt: "2026-01-09T12:35:11.930Z",
            updatedAt: "2026-01-09T12:35:11.953Z",
        },
    },
    {
        queryKey: [
            "matchAdvances",
            {
                application: "AppFive",
                epochIndex: "0",
                tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
                    leftNode:
                        "0xc2a1e4406e117170e1539376ae0b2bf8a8ba65dd241ac4cc6a19efb376041f54",
                    blockNumber: "$bigint:1134",
                    txHash: "0xda3e53c9ccf0914d77eef53adeb14a692f79a6e60f2b74d05dfb6eaa7f1800ea",
                    createdAt: "2026-01-09T12:35:11.931Z",
                    updatedAt: "2026-01-09T12:35:11.931Z",
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
            "tournaments",
            {
                application: "AppFive",
                epochIndex: "0",
                tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                parentTournamentAddress:
                    "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                parentMatchIdHash:
                    "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
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
];

export default queries;
