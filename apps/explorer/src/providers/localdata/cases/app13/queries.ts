const queries = [
    {
        queryKey: [
            "epochs",
            {
                application: "AppThirteen",
                descending: true,
            },
        ],
        data: {
            data: [
                {
                    index: "$bigint:0",
                    firstBlock: "$bigint:728",
                    lastBlock: "$bigint:1111",
                    inputIndexLowerBound: "$bigint:7",
                    inputIndexUpperBound: "$bigint:10",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    commitment:
                        "0xfc01e1004bdb867cf245517bfcaae66a9c2940bc8db16ff6733d9f61ea8225e7",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    claimHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    claimTransactionHash:
                        "0x59ec08bd457a7df7501f9fa50719d5eddb2cf5e4089fffe5abaa5791c4833d90",
                    status: "CLAIM_COMPUTED",
                    virtualIndex: "$bigint:0",
                    createdAt: "2026-01-13T09:58:30.523Z",
                    updatedAt: "2026-01-13T09:58:38.665Z",
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
                application: "AppThirteen",
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
            status: "CLAIM_COMPUTED",
            virtualIndex: "$bigint:3",
            createdAt: "2026-01-13T09:58:30.523Z",
            updatedAt: "2026-01-13T09:58:38.665Z",
        },
    },
    {
        queryKey: [
            "inputs",
            {
                application: "AppThirteen",
                descending: true,
                epochIndex: "0",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:2",
                    blockNumber: "$bigint:836",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000034400000000000000000000000000000000000000000000000000000000691385d329b17467fd1e2b37e13b1444ffcb6e7dc8efc8569289ed8238e562f92141f9ab00000000000000000000000000000000000000000000000000000000000000090000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xc0603264a9d8f18c67c534ab9f0a71c41fead1d7",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:836",
                        blockTimestamp: "$bigint:1762887123",
                        prevRandao:
                            "$bigint:18858362128486850896981793978705427656546172914990851142476725843170219391403",
                        index: "$bigint:2",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0xdc16f04b75dc643a4b2ee4b6cb297d82ba54c0443cc11a4b2939c26d86ba4a46",
                    createdAt: "2026-01-13T09:58:30.523Z",
                    updatedAt: "2026-01-13T09:58:32.582Z",
                },
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:1",
                    blockNumber: "$bigint:835",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000034300000000000000000000000000000000000000000000000000000000691385d3be55c9b08494f4ebdc165ced89a87184a9aa2572e622fd35faeb63c7309dc1ae00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xc0603264a9d8f18c67c534ab9f0a71c41fead1d7",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:835",
                        blockTimestamp: "$bigint:1762887123",
                        prevRandao:
                            "$bigint:86091015241255594523048715501868760928503729114035859233961744657850992279982",
                        index: "$bigint:1",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0x5cfd878b34a675a04cf0299402c6aa64fc214008d970770b918567d8e60ad36b",
                    createdAt: "2026-01-13T09:58:30.523Z",
                    updatedAt: "2026-01-13T09:58:32.572Z",
                },
                {
                    epochIndex: "$bigint:0",
                    index: "$bigint:0",
                    blockNumber: "$bigint:834",
                    rawData:
                        "0x415bf363000000000000000000000000000000000000000000000000000000000000343a000000000000000000000000fc0e04b72f5630b277a07cd50c7f88ca2331eb65000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000000000034200000000000000000000000000000000000000000000000000000000691385d319bfb18501e42a6389387886a8c50f066cb3ebd88aaa95d6ac1f2ed19f7fe29c00000000000000000000000000000000000000000000000000000000000000070000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000001048656c6c6f2076726f6d20446176652100000000000000000000000000000000",
                    decodedData: {
                        chainId: "$bigint:13370",
                        applicationContract:
                            "0xc0603264a9d8f18c67c534ab9f0a71c41fead1d7",
                        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                        blockNumber: "$bigint:834",
                        blockTimestamp: "$bigint:1762887123",
                        prevRandao:
                            "$bigint:11646514198929793944740418135977007399552759175391296470616300755668432839324",
                        index: "$bigint:0",
                        payload: "0x48656c6c6f2076726f6d204461766521",
                    },
                    status: "REJECTED",
                    machineHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    outputsHash:
                        "0x0a162946e56158bac0673e6dd3bdfdc1e4a0e7744a120fdb640050c8d7abe1c6",
                    transactionReference:
                        "0xa478e4272cfba4fe926ff32f1e7ddd640a848695db80b8c836988ddd61f1d817",
                    createdAt: "2026-01-13T09:58:30.523Z",
                    updatedAt: "2026-01-13T09:58:32.563Z",
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
                application: "AppThirteen",
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
            winnerCommitment: null,
            finalStateHash: null,
            finishedAtBlock: "$bigint:1504",
            createdAt: "2026-01-13T09:58:38.611Z",
            updatedAt: "2026-01-13T09:58:38.611Z",
        },
    },
    {
        queryKey: [
            "matches",
            {
                application: "AppThirteen",
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
                    winnerCommitment: "NONE",
                    deletionReason: "CHILD_TOURNAMENT",
                    deletionBlockNumber: "$bigint:1504",
                    deletionTxHash:
                        "0x270ff512ce6282fc112d18e8acea1afca630aa3f33f947592e42e8b002b70f0f",
                    createdAt: "2026-01-13T09:58:38.614Z",
                    updatedAt: "2026-01-13T09:58:38.637Z",
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
                application: "AppThirteen",
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
                    createdAt: "2026-01-13T09:58:38.613Z",
                    updatedAt: "2026-01-13T09:58:38.613Z",
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
                    createdAt: "2026-01-13T09:58:38.614Z",
                    updatedAt: "2026-01-13T09:58:38.614Z",
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
                application: "AppThirteen",
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppThirteen",
                epochIndex: "0",
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "tournament",
            {
                application: "AppThirteen",
                address: null,
                enabled: false,
            },
        ],
    },
    {
        queryKey: [
            "match",
            {
                application: "AppThirteen",
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
                application: "AppThirteen",
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
            winnerCommitment: "NONE",
            deletionReason: "CHILD_TOURNAMENT",
            deletionBlockNumber: "$bigint:1504",
            deletionTxHash:
                "0x270ff512ce6282fc112d18e8acea1afca630aa3f33f947592e42e8b002b70f0f",
            createdAt: "2026-01-13T09:58:38.614Z",
            updatedAt: "2026-01-13T09:58:38.637Z",
        },
    },
    {
        queryKey: [
            "matchAdvances",
            {
                application: "AppThirteen",
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
                    createdAt: "2026-01-13T09:58:38.615Z",
                    updatedAt: "2026-01-13T09:58:38.615Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xc2a1e4406e117170e1539376ae0b2bf8a8ba65dd241ac4cc6a19efb376041f54",
                    leftNode:
                        "0xaa5945bb1c145a6ddde89bacffbda841a4049af4f20bb32f79dad4a14eef6bf3",
                    blockNumber: "$bigint:1135",
                    txHash: "0x89f986df6290a9157862849a6a0b92df8b170bcaca15a7c4ac8ba15886d53bd3",
                    createdAt: "2026-01-13T09:58:38.615Z",
                    updatedAt: "2026-01-13T09:58:38.615Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xaa5945bb1c145a6ddde89bacffbda841a4049af4f20bb32f79dad4a14eef6bf3",
                    leftNode:
                        "0x96e1b82f2632d0b5ce9d406f26db76a3e9a7aef1cff0c29ffcbd3d193c508919",
                    blockNumber: "$bigint:1136",
                    txHash: "0x75ea44f31192dd174cb1834ca1f41deea2d33f22cfd3841f6ad799099ed76d96",
                    createdAt: "2026-01-13T09:58:38.616Z",
                    updatedAt: "2026-01-13T09:58:38.616Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x96e1b82f2632d0b5ce9d406f26db76a3e9a7aef1cff0c29ffcbd3d193c508919",
                    leftNode:
                        "0xe4b843f41c3228fdff3c9db457d895ba444be689f42d58902e56b3eb5b05c6d1",
                    blockNumber: "$bigint:1137",
                    txHash: "0x7adac1a62f3e5fd04f096f7c6fb233a6e8dd2a96bcc3463e16ff2927431d623a",
                    createdAt: "2026-01-13T09:58:38.616Z",
                    updatedAt: "2026-01-13T09:58:38.616Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xe4b843f41c3228fdff3c9db457d895ba444be689f42d58902e56b3eb5b05c6d1",
                    leftNode:
                        "0x27224e3bfb947cd11ec0432ca19ecf6590f6b81973a0d4e4f147ebca84767112",
                    blockNumber: "$bigint:1138",
                    txHash: "0xb8df76d2cfad6edbea139ea38afce747fff297fa8172ff33d0facfdb07319aaf",
                    createdAt: "2026-01-13T09:58:38.617Z",
                    updatedAt: "2026-01-13T09:58:38.617Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x27224e3bfb947cd11ec0432ca19ecf6590f6b81973a0d4e4f147ebca84767112",
                    leftNode:
                        "0x91846ef1f6aaff21ee6386de1cbe723365d11e7a334eca69ca2f0e9c5457bbab",
                    blockNumber: "$bigint:1139",
                    txHash: "0xb9253c3030d63026d9b7c0f16f839d56c423604ad189e1504741d47509bf7146",
                    createdAt: "2026-01-13T09:58:38.617Z",
                    updatedAt: "2026-01-13T09:58:38.617Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x91846ef1f6aaff21ee6386de1cbe723365d11e7a334eca69ca2f0e9c5457bbab",
                    leftNode:
                        "0xd8ea32d8f385e8bb87dc63898a00bb29721bb45ec938590900f560ed2db183fb",
                    blockNumber: "$bigint:1140",
                    txHash: "0xeb75de5651db2017fd1325def94d28fc1cc3c0d6efb1f184d0e54f3e87743532",
                    createdAt: "2026-01-13T09:58:38.618Z",
                    updatedAt: "2026-01-13T09:58:38.618Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xd8ea32d8f385e8bb87dc63898a00bb29721bb45ec938590900f560ed2db183fb",
                    leftNode:
                        "0xdd8c67106039f26b7f2ff0a94b0ece89d284c519ed2aaff4fd8be6d8764314ae",
                    blockNumber: "$bigint:1141",
                    txHash: "0x969933b0522359baa3633d26387af28f499b68fa0ab880fe845417f176856146",
                    createdAt: "2026-01-13T09:58:38.618Z",
                    updatedAt: "2026-01-13T09:58:38.618Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xdd8c67106039f26b7f2ff0a94b0ece89d284c519ed2aaff4fd8be6d8764314ae",
                    leftNode:
                        "0xcb1cffc24f481e025463a6362ec51916ebd5aeead246bb5cef19eec1766d27c0",
                    blockNumber: "$bigint:1142",
                    txHash: "0x341609bd2c5fab010dd2f0dc0b2d0e7275238500a4d462a8406cc353bbfd4a03",
                    createdAt: "2026-01-13T09:58:38.619Z",
                    updatedAt: "2026-01-13T09:58:38.619Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xcb1cffc24f481e025463a6362ec51916ebd5aeead246bb5cef19eec1766d27c0",
                    leftNode:
                        "0x7a7d29f631fea5b4ebe4af4f8a6c99be927b37635ca1ec8c36675d176b30f9b6",
                    blockNumber: "$bigint:1143",
                    txHash: "0x39efa013feb3a1be3819535360c59a3dbca6d08bd10c21627a0c881df5813d5d",
                    createdAt: "2026-01-13T09:58:38.619Z",
                    updatedAt: "2026-01-13T09:58:38.619Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x7a7d29f631fea5b4ebe4af4f8a6c99be927b37635ca1ec8c36675d176b30f9b6",
                    leftNode:
                        "0xc655d6193550f3cb6e05893bdcdeb1da136da2e4bf861c61ef0deab6218ee60e",
                    blockNumber: "$bigint:1144",
                    txHash: "0x8aa9522843cb86701f01f786f6becd5ff9e5c15be96d17ae67ba9ee313e7ab8f",
                    createdAt: "2026-01-13T09:58:38.620Z",
                    updatedAt: "2026-01-13T09:58:38.620Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xc655d6193550f3cb6e05893bdcdeb1da136da2e4bf861c61ef0deab6218ee60e",
                    leftNode:
                        "0x380b941769ed730c97150e88cf1ced8b7327f96284f1a27e57ca85614f22a517",
                    blockNumber: "$bigint:1145",
                    txHash: "0xdbaa29817298c1752e1e48574ca152c47841fe351fb242835025bd81a96fc973",
                    createdAt: "2026-01-13T09:58:38.620Z",
                    updatedAt: "2026-01-13T09:58:38.620Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x380b941769ed730c97150e88cf1ced8b7327f96284f1a27e57ca85614f22a517",
                    leftNode:
                        "0xfcffe6529394c6e3b6dc78435290adf17c3a720def78fd6931e109606d4d1da7",
                    blockNumber: "$bigint:1146",
                    txHash: "0xc842f987a2ce23e567aae9db6080d71dd2ddd3886be4819438182de63f1647db",
                    createdAt: "2026-01-13T09:58:38.620Z",
                    updatedAt: "2026-01-13T09:58:38.620Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xfcffe6529394c6e3b6dc78435290adf17c3a720def78fd6931e109606d4d1da7",
                    leftNode:
                        "0x54f5e0e6774d9af932fb4db34ab76db4c4ee739427fa4c4abaae5c64c4c7d74f",
                    blockNumber: "$bigint:1147",
                    txHash: "0x50cd818b5b7d118eb779755e4a0589a86245653c98ce2c7cc681566fe01cb868",
                    createdAt: "2026-01-13T09:58:38.621Z",
                    updatedAt: "2026-01-13T09:58:38.621Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x54f5e0e6774d9af932fb4db34ab76db4c4ee739427fa4c4abaae5c64c4c7d74f",
                    leftNode:
                        "0xa2cf2b726fb144664cd7653c3e74d6c34ff205319feee70f53e0d40524c30dba",
                    blockNumber: "$bigint:1148",
                    txHash: "0x937f14b54f2116108fa19d8b7214bc2830ab1e105fec1ac9d0918920448fca76",
                    createdAt: "2026-01-13T09:58:38.621Z",
                    updatedAt: "2026-01-13T09:58:38.621Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xa2cf2b726fb144664cd7653c3e74d6c34ff205319feee70f53e0d40524c30dba",
                    leftNode:
                        "0xabcaa4b5469f36b41fb8ff9c7d0b63c6974792db96349b7645342a25610188e8",
                    blockNumber: "$bigint:1149",
                    txHash: "0x0c0eb68310336594ae69e4e0ed4636f428322dbb7e4e66938352a1dbeb07b47a",
                    createdAt: "2026-01-13T09:58:38.622Z",
                    updatedAt: "2026-01-13T09:58:38.622Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xabcaa4b5469f36b41fb8ff9c7d0b63c6974792db96349b7645342a25610188e8",
                    leftNode:
                        "0x4a754821c4bc9fd33812e1e1ec6f040befe381238d20f7649f585b1de2de12bb",
                    blockNumber: "$bigint:1150",
                    txHash: "0xf5af51fe74fe1816696ea4ddcfdb0aa0e38fa16d56f02608714b4727f9660eb3",
                    createdAt: "2026-01-13T09:58:38.622Z",
                    updatedAt: "2026-01-13T09:58:38.622Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x4a754821c4bc9fd33812e1e1ec6f040befe381238d20f7649f585b1de2de12bb",
                    leftNode:
                        "0x1abe3c4896045500fe6e256ef72e086221b16ef30e35cf9cf4e83407712f6441",
                    blockNumber: "$bigint:1151",
                    txHash: "0xc726dc56e54205f4b0e1703ce414c4f339d4f3b1a2409cc730bc6854e61b34ff",
                    createdAt: "2026-01-13T09:58:38.623Z",
                    updatedAt: "2026-01-13T09:58:38.623Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x1abe3c4896045500fe6e256ef72e086221b16ef30e35cf9cf4e83407712f6441",
                    leftNode:
                        "0x264d44ab47ab987eff7573a8c6c59d9ff03b4969eda8d73f3ff65ab7faa6f93d",
                    blockNumber: "$bigint:1152",
                    txHash: "0xdc74b3fc8d78139433ba9d762f06fd7f04d8971108d3c9fe5dd7b3d0f5621b1a",
                    createdAt: "2026-01-13T09:58:38.623Z",
                    updatedAt: "2026-01-13T09:58:38.623Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x264d44ab47ab987eff7573a8c6c59d9ff03b4969eda8d73f3ff65ab7faa6f93d",
                    leftNode:
                        "0x1ea31621c5ab10cb8d4f2199275066fbb1126ebe34a9cb4dd72f1c049a4f5f10",
                    blockNumber: "$bigint:1153",
                    txHash: "0x9111dde8ddfe4c7dcf2d24324aee7988995911464d7a7bbbc6c14f54cf175604",
                    createdAt: "2026-01-13T09:58:38.624Z",
                    updatedAt: "2026-01-13T09:58:38.624Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x1ea31621c5ab10cb8d4f2199275066fbb1126ebe34a9cb4dd72f1c049a4f5f10",
                    leftNode:
                        "0x5e1caf7b3d348d2a925dc09254058c3592733112993d6654b49333d22133e750",
                    blockNumber: "$bigint:1154",
                    txHash: "0x9efd468ac6475096eded876ab2a26aed85ce76e83250bd0c6d75ca01852ffe3c",
                    createdAt: "2026-01-13T09:58:38.624Z",
                    updatedAt: "2026-01-13T09:58:38.624Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x5e1caf7b3d348d2a925dc09254058c3592733112993d6654b49333d22133e750",
                    leftNode:
                        "0xfa3c3e62465a56961e7c14509d56a4d78334b63469b2c1c11321bbf0841735c5",
                    blockNumber: "$bigint:1155",
                    txHash: "0x188277436a3369c5f0a5c40c1d431456e19a1278eac74a9a3bb1127d30725062",
                    createdAt: "2026-01-13T09:58:38.625Z",
                    updatedAt: "2026-01-13T09:58:38.625Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xfa3c3e62465a56961e7c14509d56a4d78334b63469b2c1c11321bbf0841735c5",
                    leftNode:
                        "0x04443efd53571847f3158c6b02b4f90d4eea698a3c77c788a85dcbfdf61228ff",
                    blockNumber: "$bigint:1156",
                    txHash: "0x5a48eacec773a41288b02d146805b2b48b0fe001cd8a980c3e15681892851c3d",
                    createdAt: "2026-01-13T09:58:38.625Z",
                    updatedAt: "2026-01-13T09:58:38.625Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x04443efd53571847f3158c6b02b4f90d4eea698a3c77c788a85dcbfdf61228ff",
                    leftNode:
                        "0xd2d038563f8450834d02c179c4287f0c95734cce5fcb5c4efe5a8cce4f3f0e26",
                    blockNumber: "$bigint:1157",
                    txHash: "0x96236c9f711476d07a435285ae61142a43f46e759277e35d4e4aaac7f1d23a17",
                    createdAt: "2026-01-13T09:58:38.626Z",
                    updatedAt: "2026-01-13T09:58:38.626Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xd2d038563f8450834d02c179c4287f0c95734cce5fcb5c4efe5a8cce4f3f0e26",
                    leftNode:
                        "0xe693c2755ce3d8daa72c2c161209bcd0dcc174d12c8357a9547cfd99b1041f1a",
                    blockNumber: "$bigint:1158",
                    txHash: "0x5189459060b12682edff80b322ce7d46369ea3cd7d335d180f95bc674a4b13b0",
                    createdAt: "2026-01-13T09:58:38.626Z",
                    updatedAt: "2026-01-13T09:58:38.626Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xe693c2755ce3d8daa72c2c161209bcd0dcc174d12c8357a9547cfd99b1041f1a",
                    leftNode:
                        "0xf8e7de3ad4865e46480a799f5f7db2271d257693c77319749e026b41a081db98",
                    blockNumber: "$bigint:1159",
                    txHash: "0xa1021efa17eec32e5b1b47cf74b383f793a9252104f15aef19a5fc8b28f64b36",
                    createdAt: "2026-01-13T09:58:38.627Z",
                    updatedAt: "2026-01-13T09:58:38.627Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xf8e7de3ad4865e46480a799f5f7db2271d257693c77319749e026b41a081db98",
                    leftNode:
                        "0x23f8c3eaf7407fbb40862df9ddf1bfe1017b33679b06204f5bad90162a0e3f7a",
                    blockNumber: "$bigint:1160",
                    txHash: "0x225bf981dffd2b8fdd939d350a9003649cd71f75ab04c0b696d5675274ecee66",
                    createdAt: "2026-01-13T09:58:38.627Z",
                    updatedAt: "2026-01-13T09:58:38.627Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x23f8c3eaf7407fbb40862df9ddf1bfe1017b33679b06204f5bad90162a0e3f7a",
                    leftNode:
                        "0x147aeca618e64baa54af7dac93b75090015f4ed539d0576849d0a261614fda85",
                    blockNumber: "$bigint:1161",
                    txHash: "0xc076a89296541eebd8fb87006eeaa5002858bf4ba5ec303fc66c649de3ada9ce",
                    createdAt: "2026-01-13T09:58:38.628Z",
                    updatedAt: "2026-01-13T09:58:38.628Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x147aeca618e64baa54af7dac93b75090015f4ed539d0576849d0a261614fda85",
                    leftNode:
                        "0x50359a1f09238f4a84c2d1f5d3b7e7559260d0e62a3d0c5c6efac784fa1118ac",
                    blockNumber: "$bigint:1162",
                    txHash: "0x85fafccf0bc2dbdae9c905368b5329363a74c8071215be46920316266ca2f6ea",
                    createdAt: "2026-01-13T09:58:38.628Z",
                    updatedAt: "2026-01-13T09:58:38.628Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x50359a1f09238f4a84c2d1f5d3b7e7559260d0e62a3d0c5c6efac784fa1118ac",
                    leftNode:
                        "0xf538c91de551efb14097c2cab7a6ea615b78ca9a3d371f4aa0f98b871653ef3d",
                    blockNumber: "$bigint:1163",
                    txHash: "0xabe202c50d289fcf72c92b40ef80cc9cb7cb4a37ca5c599202f64bbed62c94a5",
                    createdAt: "2026-01-13T09:58:38.629Z",
                    updatedAt: "2026-01-13T09:58:38.629Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xf538c91de551efb14097c2cab7a6ea615b78ca9a3d371f4aa0f98b871653ef3d",
                    leftNode:
                        "0x9305646da912c3c76854b8654e439a6fa9db8387328b19a76db1cb64ca690f7c",
                    blockNumber: "$bigint:1164",
                    txHash: "0x106de852b8f115934ad41f0fbe0f5d5b7ae1cb8fbaa8e571c0cb450756381d40",
                    createdAt: "2026-01-13T09:58:38.629Z",
                    updatedAt: "2026-01-13T09:58:38.629Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x9305646da912c3c76854b8654e439a6fa9db8387328b19a76db1cb64ca690f7c",
                    leftNode:
                        "0xf85f886686fd35a6da874a1a3f987ed33b83637e19391d7a25fdb25d31f63af2",
                    blockNumber: "$bigint:1165",
                    txHash: "0xe0f178918e8cc17d11e54f70c407ed0e4f6c49baafeabaa38695ca13873fba69",
                    createdAt: "2026-01-13T09:58:38.630Z",
                    updatedAt: "2026-01-13T09:58:38.630Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xf85f886686fd35a6da874a1a3f987ed33b83637e19391d7a25fdb25d31f63af2",
                    leftNode:
                        "0xf87114f39219f1e240eaab4a278ac3c70e6d8c8d12868921cf58406a00b1d7e9",
                    blockNumber: "$bigint:1166",
                    txHash: "0x86b8f1f730392d7d23fed07b21224c5b743302345a2cd84fc99b385dda120e7f",
                    createdAt: "2026-01-13T09:58:38.630Z",
                    updatedAt: "2026-01-13T09:58:38.630Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xf87114f39219f1e240eaab4a278ac3c70e6d8c8d12868921cf58406a00b1d7e9",
                    leftNode:
                        "0x15f9d320ac84190b75a7e47df5db001202cb10c56c91a7011f41cf71776d5fb9",
                    blockNumber: "$bigint:1167",
                    txHash: "0x4b44d58fd640b8aabba02cf9a3213dec50c66e7fc6412bf1e157cb351da689be",
                    createdAt: "2026-01-13T09:58:38.630Z",
                    updatedAt: "2026-01-13T09:58:38.630Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x15f9d320ac84190b75a7e47df5db001202cb10c56c91a7011f41cf71776d5fb9",
                    leftNode:
                        "0xfe3064fb69c072e4efa89d9aded49a82c87834850b5ce2c5d7e29db064a6047e",
                    blockNumber: "$bigint:1168",
                    txHash: "0x4f669e5d443f37a11c781e23fc083c802897e5a1f54d365475a727557f7a7a0f",
                    createdAt: "2026-01-13T09:58:38.631Z",
                    updatedAt: "2026-01-13T09:58:38.631Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xfe3064fb69c072e4efa89d9aded49a82c87834850b5ce2c5d7e29db064a6047e",
                    leftNode:
                        "0x281efe7aa7f6c550809086047a1b52675e3b525858605f6ae112e7aceba24a88",
                    blockNumber: "$bigint:1169",
                    txHash: "0x1dbc4bbd2fb6039b37a2b548295fa49ee503c0601538d436bd62320cca7f8170",
                    createdAt: "2026-01-13T09:58:38.631Z",
                    updatedAt: "2026-01-13T09:58:38.631Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x281efe7aa7f6c550809086047a1b52675e3b525858605f6ae112e7aceba24a88",
                    leftNode:
                        "0xae8b1562bb451e64c812b99badff03ee2270e5f18e1c00c1a2681ba5dd40bf1d",
                    blockNumber: "$bigint:1170",
                    txHash: "0x7b86b34ab6d2fe4108a0051071f574f684c4b89cce353317a2505c68c20d5ed7",
                    createdAt: "2026-01-13T09:58:38.632Z",
                    updatedAt: "2026-01-13T09:58:38.632Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xae8b1562bb451e64c812b99badff03ee2270e5f18e1c00c1a2681ba5dd40bf1d",
                    leftNode:
                        "0x300e7d8066efa6dc35b89c08e4ef678147eff5bd6fc78767ffbf3f0a80d53df9",
                    blockNumber: "$bigint:1171",
                    txHash: "0xe4d4b4a29dab98c04aeb6a1d3076e4539288deea8f1398d678ab864f71f1117b",
                    createdAt: "2026-01-13T09:58:38.632Z",
                    updatedAt: "2026-01-13T09:58:38.632Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x300e7d8066efa6dc35b89c08e4ef678147eff5bd6fc78767ffbf3f0a80d53df9",
                    leftNode:
                        "0xa6a788d01c58e70bef1bc116adcdda925cda30b2f97e16a7c5d33c4a671419ba",
                    blockNumber: "$bigint:1172",
                    txHash: "0x916f471c0bd9672ddd00538ba2e11e34db507059a5126cb8b8012bacd93e6bcc",
                    createdAt: "2026-01-13T09:58:38.633Z",
                    updatedAt: "2026-01-13T09:58:38.633Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xa6a788d01c58e70bef1bc116adcdda925cda30b2f97e16a7c5d33c4a671419ba",
                    leftNode:
                        "0x2cadc8f07f529840d48097cb2fb8570bf3d8c2ee421f116fcfb77ddbc6191c28",
                    blockNumber: "$bigint:1173",
                    txHash: "0xc359a8099d0e21087d3dc5c456e5449bf295143156f21b3bc9b53835b424eeb5",
                    createdAt: "2026-01-13T09:58:38.633Z",
                    updatedAt: "2026-01-13T09:58:38.633Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x2cadc8f07f529840d48097cb2fb8570bf3d8c2ee421f116fcfb77ddbc6191c28",
                    leftNode:
                        "0x034b88f238b3c842b7a88f3ad02c22c6d6b4d11de55ea574538f8547b4cc6a87",
                    blockNumber: "$bigint:1174",
                    txHash: "0x4e29b2c7e5f451108e543982df31f1bc5e48192fa6fc967adddf0172ebd611e6",
                    createdAt: "2026-01-13T09:58:38.634Z",
                    updatedAt: "2026-01-13T09:58:38.634Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x034b88f238b3c842b7a88f3ad02c22c6d6b4d11de55ea574538f8547b4cc6a87",
                    leftNode:
                        "0x2bde4ef6442afdc687a20ec7e185bc869898c165d0c0ed08f92e034d79d7887c",
                    blockNumber: "$bigint:1175",
                    txHash: "0xed5f4762bbcab7d3d22118ed356c2416b6483efdd149aa3410396506e1c07c39",
                    createdAt: "2026-01-13T09:58:38.634Z",
                    updatedAt: "2026-01-13T09:58:38.634Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0x2bde4ef6442afdc687a20ec7e185bc869898c165d0c0ed08f92e034d79d7887c",
                    leftNode:
                        "0xb905878605e06c1dbe162c29eff50deb51f5516bd3f640e16b382fce8577a771",
                    blockNumber: "$bigint:1176",
                    txHash: "0x0a041d1a0ab2475467bef04b7b5a9f4c55ccb1a6f16061dafda705b44cf3ea0d",
                    createdAt: "2026-01-13T09:58:38.635Z",
                    updatedAt: "2026-01-13T09:58:38.635Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xb905878605e06c1dbe162c29eff50deb51f5516bd3f640e16b382fce8577a771",
                    leftNode:
                        "0xc4f03600fde9ae4dbeed7194931e485879135097dcad7bf4f9dbec7a9c5ded40",
                    blockNumber: "$bigint:1177",
                    txHash: "0xea0e991ec981da79638b2860c6e01f05597a061889531681b39663935c3d287c",
                    createdAt: "2026-01-13T09:58:38.635Z",
                    updatedAt: "2026-01-13T09:58:38.635Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xc4f03600fde9ae4dbeed7194931e485879135097dcad7bf4f9dbec7a9c5ded40",
                    leftNode:
                        "0xa2d461dbd3ffafd4e5c06c455ae526f73f98fa7d4756db320824502257059594",
                    blockNumber: "$bigint:1178",
                    txHash: "0x576e56af200cfb98d54382218d4b0cd952d06080d7c77413c94d0836c512b440",
                    createdAt: "2026-01-13T09:58:38.636Z",
                    updatedAt: "2026-01-13T09:58:38.636Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xa2d461dbd3ffafd4e5c06c455ae526f73f98fa7d4756db320824502257059594",
                    leftNode:
                        "0xd49abadda9c26a000d974a2bda06c01b7a6f46529834138a8b435b89f5448f8e",
                    blockNumber: "$bigint:1179",
                    txHash: "0x5285169aa1e0c02717a257bf4ac044bef82e13ca20f1a923aae90147e04857f4",
                    createdAt: "2026-01-13T09:58:38.636Z",
                    updatedAt: "2026-01-13T09:58:38.636Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    otherParent:
                        "0xd49abadda9c26a000d974a2bda06c01b7a6f46529834138a8b435b89f5448f8e",
                    leftNode:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    blockNumber: "$bigint:1180",
                    txHash: "0x37d8a84ed3658958c9953c99bdc35dc95ad5c435dc051e58f7fcd71a9a16bae7",
                    createdAt: "2026-01-13T09:58:38.637Z",
                    updatedAt: "2026-01-13T09:58:38.637Z",
                },
            ],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 47,
            },
        },
    },
    {
        queryKey: [
            "tournaments",
            {
                application: "AppThirteen",
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
            data: [
                {
                    epochIndex: "$bigint:0",
                    address: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    parentTournamentAddress:
                        "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                    parentMatchIdHash:
                        "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                    maxLevel: "$bigint:3",
                    level: "$bigint:1",
                    log2step: "$bigint:27",
                    height: "$bigint:17",
                    winnerCommitment: null,
                    finalStateHash: null,
                    finishedAtBlock: "$bigint:1503",
                    createdAt: "2026-01-13T09:58:38.639Z",
                    updatedAt: "2026-01-13T09:58:38.639Z",
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
                application: "AppThirteen",
                address: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            address: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            parentTournamentAddress:
                "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            parentMatchIdHash:
                "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
            maxLevel: "$bigint:3",
            level: "$bigint:1",
            log2step: "$bigint:27",
            height: "$bigint:17",
            winnerCommitment: null,
            finalStateHash: null,
            finishedAtBlock: "$bigint:1503",
            createdAt: "2026-01-13T09:58:38.639Z",
            updatedAt: "2026-01-13T09:58:38.639Z",
        },
    },
    {
        queryKey: [
            "matches",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    commitmentOne:
                        "0x961d025f7e9e91334618a2e2459efe4464f4981c8dd22e8098bdf12cd239a0fa",
                    commitmentTwo:
                        "0x236cb3df32a6d11995d35c2a2abf92d155545e3354602d3e11abc9adbae15c1b",
                    leftOfTwo:
                        "0x7e7e2a25266392b6f5009cdddd26c79b33e1f27acfcc7c748819c65f748eabe8",
                    blockNumber: "$bigint:1183",
                    txHash: "0xdac81ed57334d312326a8955d233b48422cd8973c2699a1b8cd364ffb6957845",
                    winnerCommitment: "NONE",
                    deletionReason: "CHILD_TOURNAMENT",
                    deletionBlockNumber: "$bigint:1503",
                    deletionTxHash:
                        "0xa5e25d6bd19904bc0f295ea61903b62abf30b30d33e24c96c12083a1467ec27c",
                    createdAt: "2026-01-13T09:58:38.641Z",
                    updatedAt: "2026-01-13T09:58:38.649Z",
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
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    commitment:
                        "0x961d025f7e9e91334618a2e2459efe4464f4981c8dd22e8098bdf12cd239a0fa",
                    finalStateHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    submitterAddress:
                        "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
                    blockNumber: "$bigint:1182",
                    txHash: "0xa93761f95dca4b091cd58ab432a34c3a6d58a5bbc3d3cfc41c112f9741e5a813",
                    createdAt: "2026-01-13T09:58:38.640Z",
                    updatedAt: "2026-01-13T09:58:38.640Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    commitment:
                        "0x236cb3df32a6d11995d35c2a2abf92d155545e3354602d3e11abc9adbae15c1b",
                    finalStateHash:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                    submitterAddress:
                        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    blockNumber: "$bigint:1183",
                    txHash: "0xdac81ed57334d312326a8955d233b48422cd8973c2699a1b8cd364ffb6957845",
                    createdAt: "2026-01-13T09:58:38.640Z",
                    updatedAt: "2026-01-13T09:58:38.640Z",
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
                application: "AppThirteen",
                address: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                enabled: true,
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
            winnerCommitment: null,
            finalStateHash: null,
            finishedAtBlock: "$bigint:1504",
            createdAt: "2026-01-13T09:58:38.611Z",
            updatedAt: "2026-01-13T09:58:38.611Z",
        },
    },
    {
        queryKey: [
            "match",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
                idHash: "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
                enabled: true,
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
            winnerCommitment: "NONE",
            deletionReason: "CHILD_TOURNAMENT",
            deletionBlockNumber: "$bigint:1504",
            deletionTxHash:
                "0x270ff512ce6282fc112d18e8acea1afca630aa3f33f947592e42e8b002b70f0f",
            createdAt: "2026-01-13T09:58:38.614Z",
            updatedAt: "2026-01-13T09:58:38.637Z",
        },
    },
    {
        queryKey: [
            "match",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
            commitmentOne:
                "0x961d025f7e9e91334618a2e2459efe4464f4981c8dd22e8098bdf12cd239a0fa",
            commitmentTwo:
                "0x236cb3df32a6d11995d35c2a2abf92d155545e3354602d3e11abc9adbae15c1b",
            leftOfTwo:
                "0x7e7e2a25266392b6f5009cdddd26c79b33e1f27acfcc7c748819c65f748eabe8",
            blockNumber: "$bigint:1183",
            txHash: "0xdac81ed57334d312326a8955d233b48422cd8973c2699a1b8cd364ffb6957845",
            winnerCommitment: "NONE",
            deletionReason: "CHILD_TOURNAMENT",
            deletionBlockNumber: "$bigint:1503",
            deletionTxHash:
                "0xa5e25d6bd19904bc0f295ea61903b62abf30b30d33e24c96c12083a1467ec27c",
            createdAt: "2026-01-13T09:58:38.641Z",
            updatedAt: "2026-01-13T09:58:38.649Z",
        },
    },
    {
        queryKey: [
            "matchAdvances",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x7e7e2a25266392b6f5009cdddd26c79b33e1f27acfcc7c748819c65f748eabe8",
                    leftNode:
                        "0x00c82c86e8afb8955c9e78c2bfd3cce9c6aaba958db9c8e3a6fde2a966a2b051",
                    blockNumber: "$bigint:1184",
                    txHash: "0xffd9d8b6833be867d6ff80a7189c8afca44b437f229fdb45d0eb362cd2cd9e58",
                    createdAt: "2026-01-13T09:58:38.641Z",
                    updatedAt: "2026-01-13T09:58:38.641Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x00c82c86e8afb8955c9e78c2bfd3cce9c6aaba958db9c8e3a6fde2a966a2b051",
                    leftNode:
                        "0x7ed25ef930ac5e83cfa3f645e6b5fa5d0bf152f62d084e6e0f466c3124a99560",
                    blockNumber: "$bigint:1185",
                    txHash: "0xa8886f06089faccd54edb0dd41f2f35c3e359b171fbaad19fd06aec573cbfda8",
                    createdAt: "2026-01-13T09:58:38.642Z",
                    updatedAt: "2026-01-13T09:58:38.642Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x7ed25ef930ac5e83cfa3f645e6b5fa5d0bf152f62d084e6e0f466c3124a99560",
                    leftNode:
                        "0x8e6c810a82cca38dc9701eee9993e11b2cd5531a34f9c80e19b996ac7820182f",
                    blockNumber: "$bigint:1186",
                    txHash: "0xc802655c8e96b84dccfe6eef348094b23db69378a669d8eb9ba96b525efc9c51",
                    createdAt: "2026-01-13T09:58:38.642Z",
                    updatedAt: "2026-01-13T09:58:38.642Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x8e6c810a82cca38dc9701eee9993e11b2cd5531a34f9c80e19b996ac7820182f",
                    leftNode:
                        "0xa08b2fc93b162280e59aff2f3f9e44025f198bdb4e277c30926e53129d0d8ac8",
                    blockNumber: "$bigint:1187",
                    txHash: "0x512796e9a97305a6a1b183f41e75950f7ceae46d84b5d99b02c9187fc577e125",
                    createdAt: "2026-01-13T09:58:38.643Z",
                    updatedAt: "2026-01-13T09:58:38.643Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0xa08b2fc93b162280e59aff2f3f9e44025f198bdb4e277c30926e53129d0d8ac8",
                    leftNode:
                        "0x4c90316769eff43426e4a0cb1e069f609ba007a46c27fee8cd6995da8c3042ab",
                    blockNumber: "$bigint:1188",
                    txHash: "0xe4d97be4de84af43a5bcbd4acc609b55ca9fda75236b791fa872d562c6779564",
                    createdAt: "2026-01-13T09:58:38.643Z",
                    updatedAt: "2026-01-13T09:58:38.643Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x4c90316769eff43426e4a0cb1e069f609ba007a46c27fee8cd6995da8c3042ab",
                    leftNode:
                        "0xd3c84f7ba7cd1a271fac7d181cb09cd2e1a3a86b91feb761427f23382385ae00",
                    blockNumber: "$bigint:1189",
                    txHash: "0xa6384ac259abf260e61afb4bcbec6d26c99ad8351c192ace190586c5dd0f544e",
                    createdAt: "2026-01-13T09:58:38.644Z",
                    updatedAt: "2026-01-13T09:58:38.644Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0xd3c84f7ba7cd1a271fac7d181cb09cd2e1a3a86b91feb761427f23382385ae00",
                    leftNode:
                        "0xae3eb1a461ed777d4a9842aeb35ab415ffbceb949251846b4d00944b6b4284d4",
                    blockNumber: "$bigint:1190",
                    txHash: "0x25ff98edfe7483659afb2e4f883208fbbf2bf7ee2657bc61c95aecd7b31add53",
                    createdAt: "2026-01-13T09:58:38.644Z",
                    updatedAt: "2026-01-13T09:58:38.644Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0xae3eb1a461ed777d4a9842aeb35ab415ffbceb949251846b4d00944b6b4284d4",
                    leftNode:
                        "0xd786a14f8dae2c549e45534d07fc302cab7102fcad62ec2afd44d99d20b94c71",
                    blockNumber: "$bigint:1191",
                    txHash: "0x8608e71daed9ca672deafdacee8c5aae122089f2a24810b4a0912a8f0f632ea3",
                    createdAt: "2026-01-13T09:58:38.645Z",
                    updatedAt: "2026-01-13T09:58:38.645Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0xd786a14f8dae2c549e45534d07fc302cab7102fcad62ec2afd44d99d20b94c71",
                    leftNode:
                        "0xcedfe5ab7f31377079f164ccb6e71481f8253571d05ad132435f67787ae39682",
                    blockNumber: "$bigint:1192",
                    txHash: "0x295ee7006cd416aeb72a14a2c592787490b249c4e8450c8f8609ef31247fd50a",
                    createdAt: "2026-01-13T09:58:38.645Z",
                    updatedAt: "2026-01-13T09:58:38.645Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0xcedfe5ab7f31377079f164ccb6e71481f8253571d05ad132435f67787ae39682",
                    leftNode:
                        "0x8e58b06a89e48020b9a95c1ace2eb59a5bcb7861a1aa2b8943656e2bee7fb2a0",
                    blockNumber: "$bigint:1193",
                    txHash: "0x1750e20fcad5cfa6f10349136ef3cb1cdfb058b5b7fb15ecb936f8af99f1b783",
                    createdAt: "2026-01-13T09:58:38.646Z",
                    updatedAt: "2026-01-13T09:58:38.646Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x8e58b06a89e48020b9a95c1ace2eb59a5bcb7861a1aa2b8943656e2bee7fb2a0",
                    leftNode:
                        "0x8a2f3371e450ee67e699e8a1cb7eef00659aa3819db0b23d66a97f4b7b4c7db6",
                    blockNumber: "$bigint:1194",
                    txHash: "0x6b9d89440fedce333203fd4e3b99954bed5a07a06ac4997fbf69adf467ff2e5e",
                    createdAt: "2026-01-13T09:58:38.646Z",
                    updatedAt: "2026-01-13T09:58:38.646Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x8a2f3371e450ee67e699e8a1cb7eef00659aa3819db0b23d66a97f4b7b4c7db6",
                    leftNode:
                        "0x511a54c11dd812cfa02b33fe97cb494f7580881ed43e98448a5b98420d25fe6e",
                    blockNumber: "$bigint:1195",
                    txHash: "0xa8a33df557143291d902aff32c514af78cfc8fff4fe1fb42f4772789b05b09da",
                    createdAt: "2026-01-13T09:58:38.647Z",
                    updatedAt: "2026-01-13T09:58:38.647Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x511a54c11dd812cfa02b33fe97cb494f7580881ed43e98448a5b98420d25fe6e",
                    leftNode:
                        "0x93373387bbe9cbdb30010b83384678d5f85e9ac7cd9be77985d00a79504dc8b6",
                    blockNumber: "$bigint:1196",
                    txHash: "0x57ddb3cb3a9b77b9913cb0f4a17885ad2101e327198379ee9f9cd1fbecc99001",
                    createdAt: "2026-01-13T09:58:38.647Z",
                    updatedAt: "2026-01-13T09:58:38.647Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x93373387bbe9cbdb30010b83384678d5f85e9ac7cd9be77985d00a79504dc8b6",
                    leftNode:
                        "0x9a9c335eead08166bedf08af0ed08653a96788c5260156e6a100e453c52d0111",
                    blockNumber: "$bigint:1197",
                    txHash: "0x7a18bba81ae6d06707a14f3ec1b358ada37cce8fbb7eb8d410e902a11feae419",
                    createdAt: "2026-01-13T09:58:38.648Z",
                    updatedAt: "2026-01-13T09:58:38.648Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x9a9c335eead08166bedf08af0ed08653a96788c5260156e6a100e453c52d0111",
                    leftNode:
                        "0x24f9bf9b67e066c67c0a3dcb9607c2c2f41ebc8391f436f6c6fdf204af0153dc",
                    blockNumber: "$bigint:1198",
                    txHash: "0xb4a8ec19ef8d2f80c5fa39188b82d749296e862a1dc742b60b8f8600b2518778",
                    createdAt: "2026-01-13T09:58:38.648Z",
                    updatedAt: "2026-01-13T09:58:38.648Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    otherParent:
                        "0x24f9bf9b67e066c67c0a3dcb9607c2c2f41ebc8391f436f6c6fdf204af0153dc",
                    leftNode:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                    blockNumber: "$bigint:1199",
                    txHash: "0xac868d36f89a6c0d77760368120c8b12db00b24cf0210ad75e08fe665047fb49",
                    createdAt: "2026-01-13T09:58:38.648Z",
                    updatedAt: "2026-01-13T09:58:38.648Z",
                },
            ],
            pagination: {
                limit: 50,
                offset: 0,
                totalCount: 16,
            },
        },
    },
    {
        queryKey: [
            "tournaments",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                parentTournamentAddress:
                    "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                parentMatchIdHash:
                    "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    address: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                    parentTournamentAddress:
                        "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                    parentMatchIdHash:
                        "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                    maxLevel: "$bigint:3",
                    level: "$bigint:2",
                    log2step: "$bigint:0",
                    height: "$bigint:27",
                    winnerCommitment: null,
                    finalStateHash: null,
                    finishedAtBlock: "$bigint:1492",
                    createdAt: "2026-01-13T09:58:38.650Z",
                    updatedAt: "2026-01-13T09:58:38.650Z",
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
                application: "AppThirteen",
                address: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            address: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
            parentTournamentAddress:
                "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            parentMatchIdHash:
                "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
            maxLevel: "$bigint:3",
            level: "$bigint:2",
            log2step: "$bigint:0",
            height: "$bigint:27",
            winnerCommitment: null,
            finalStateHash: null,
            finishedAtBlock: "$bigint:1492",
            createdAt: "2026-01-13T09:58:38.650Z",
            updatedAt: "2026-01-13T09:58:38.650Z",
        },
    },
    {
        queryKey: [
            "matches",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                    idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
                    commitmentOne:
                        "0x5852b20caf54764e8f41a1406478bdd8e6c8904773134418955b7318bd835828",
                    commitmentTwo:
                        "0x61f054c3779c74de38e7bacb75dc8e6429a5e01bf067c5c1216b79c70ce0ff9e",
                    leftOfTwo:
                        "0x4b4a2e57d233d6f997dfed0ae7662628f0ee89dbcfefd8575cc7e796f11f97a7",
                    blockNumber: "$bigint:1202",
                    txHash: "0x5645dd2c0775fa8a2196a94781a91e6b5ce7ea873c4428a7316827659070726d",
                    winnerCommitment: "NONE",
                    deletionReason: "TIMEOUT",
                    deletionBlockNumber: "$bigint:1230",
                    deletionTxHash:
                        "0xee7895875854a20e90c9cec80a53b108145809f0390fb1c7e7f490195e080df3",
                    createdAt: "2026-01-13T09:58:38.652Z",
                    updatedAt: "2026-01-13T09:58:38.665Z",
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
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                    commitment:
                        "0x5852b20caf54764e8f41a1406478bdd8e6c8904773134418955b7318bd835828",
                    finalStateHash:
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                    submitterAddress:
                        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    blockNumber: "$bigint:1201",
                    txHash: "0x60c65eeb9870818030e3b9e6fbcf57cafb088d00a6d465775ef941c553fc0642",
                    createdAt: "2026-01-13T09:58:38.651Z",
                    updatedAt: "2026-01-13T09:58:38.651Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                    commitment:
                        "0x61f054c3779c74de38e7bacb75dc8e6429a5e01bf067c5c1216b79c70ce0ff9e",
                    finalStateHash:
                        "0xc28d05262866798692219c469f0aa53d5258aca01b8bb0ff050b6e2b14e0af29",
                    submitterAddress:
                        "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
                    blockNumber: "$bigint:1202",
                    txHash: "0x5645dd2c0775fa8a2196a94781a91e6b5ce7ea873c4428a7316827659070726d",
                    createdAt: "2026-01-13T09:58:38.652Z",
                    updatedAt: "2026-01-13T09:58:38.652Z",
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
                application: "AppThirteen",
                address: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                enabled: true,
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            address: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            parentTournamentAddress:
                "0x61bCAb9d0D8b554009824292d2d6855DfA3AAB86",
            parentMatchIdHash:
                "0x0e1f5cbd6cc4dd9de0b940594e13f24a4065c2651d9fc70fee961ed191278ac6",
            maxLevel: "$bigint:3",
            level: "$bigint:1",
            log2step: "$bigint:27",
            height: "$bigint:17",
            winnerCommitment: null,
            finalStateHash: null,
            finishedAtBlock: "$bigint:1503",
            createdAt: "2026-01-13T09:58:38.639Z",
            updatedAt: "2026-01-13T09:58:38.639Z",
        },
    },
    {
        queryKey: [
            "match",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
                idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
                enabled: true,
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            tournamentAddress: "0x5a5a1ed824595824CE58baCe5bee590c9ef67b1A",
            idHash: "0xf960d8ad195334851338a6e3f172741e1c1fcb75b34e003bcea76b82e6824efb",
            commitmentOne:
                "0x961d025f7e9e91334618a2e2459efe4464f4981c8dd22e8098bdf12cd239a0fa",
            commitmentTwo:
                "0x236cb3df32a6d11995d35c2a2abf92d155545e3354602d3e11abc9adbae15c1b",
            leftOfTwo:
                "0x7e7e2a25266392b6f5009cdddd26c79b33e1f27acfcc7c748819c65f748eabe8",
            blockNumber: "$bigint:1183",
            txHash: "0xdac81ed57334d312326a8955d233b48422cd8973c2699a1b8cd364ffb6957845",
            winnerCommitment: "NONE",
            deletionReason: "CHILD_TOURNAMENT",
            deletionBlockNumber: "$bigint:1503",
            deletionTxHash:
                "0xa5e25d6bd19904bc0f295ea61903b62abf30b30d33e24c96c12083a1467ec27c",
            createdAt: "2026-01-13T09:58:38.641Z",
            updatedAt: "2026-01-13T09:58:38.649Z",
        },
    },
    {
        queryKey: [
            "match",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
            },
        ],
        data: {
            epochIndex: "$bigint:0",
            tournamentAddress: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
            idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
            commitmentOne:
                "0x5852b20caf54764e8f41a1406478bdd8e6c8904773134418955b7318bd835828",
            commitmentTwo:
                "0x61f054c3779c74de38e7bacb75dc8e6429a5e01bf067c5c1216b79c70ce0ff9e",
            leftOfTwo:
                "0x4b4a2e57d233d6f997dfed0ae7662628f0ee89dbcfefd8575cc7e796f11f97a7",
            blockNumber: "$bigint:1202",
            txHash: "0x5645dd2c0775fa8a2196a94781a91e6b5ce7ea873c4428a7316827659070726d",
            winnerCommitment: "NONE",
            deletionReason: "TIMEOUT",
            deletionBlockNumber: "$bigint:1230",
            deletionTxHash:
                "0xee7895875854a20e90c9cec80a53b108145809f0390fb1c7e7f490195e080df3",
            createdAt: "2026-01-13T09:58:38.652Z",
            updatedAt: "2026-01-13T09:58:38.665Z",
        },
    },
    {
        queryKey: [
            "matchAdvances",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
            },
        ],
        data: {
            data: [
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                    idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
                    otherParent:
                        "0x4b4a2e57d233d6f997dfed0ae7662628f0ee89dbcfefd8575cc7e796f11f97a7",
                    leftNode:
                        "0xa2dd3d64bae9cc088c418aa4588374a1cf1174f1a8847cb5243e0a72b9e750e3",
                    blockNumber: "$bigint:1203",
                    txHash: "0xdaae54e0bed082d053160c8c2a3fd7e844fca97fd401198589d0833fc90d4384",
                    createdAt: "2026-01-13T09:58:38.653Z",
                    updatedAt: "2026-01-13T09:58:38.653Z",
                },
                {
                    epochIndex: "$bigint:0",
                    tournamentAddress:
                        "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                    idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
                    otherParent:
                        "0xa2dd3d64bae9cc088c418aa4588374a1cf1174f1a8847cb5243e0a72b9e750e3",
                    leftNode:
                        "0x4535780a31179e92b03cf92258172ed9f4e3047cdf5a9683763cde32b4204c88",
                    blockNumber: "$bigint:1204",
                    txHash: "0x3218cffbff32b682b69e8df70d17b74d4ec8e17f26bf28c173c6878974b3528d",
                    createdAt: "2026-01-13T09:58:38.653Z",
                    updatedAt: "2026-01-13T09:58:38.653Z",
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
            "tournaments",
            {
                application: "AppThirteen",
                epochIndex: "0",
                tournamentAddress: "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                idHash: "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
                parentTournamentAddress:
                    "0x78c716FDaE477595a820D86D0eFAfe0eE54dF7dB",
                parentMatchIdHash:
                    "0x33363e2fe35cd7e0311c368c57c08fb4fcadc8974c5c39524aae22f44eba8bf3",
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
