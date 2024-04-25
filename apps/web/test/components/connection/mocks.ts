export const connectionSummaryResult = {
    fetching: false,
    stale: false,
    data: {
        inputs: {
            totalCount: 806,
            __typename: "InputConnection",
        },
        vouchers: {
            totalCount: 1,
            __typename: "VoucherConnection",
        },
        reports: {
            totalCount: 806,
            __typename: "ReportConnection",
        },
        notices: {
            totalCount: 0,
            __typename: "NoticeConnection",
        },
    },
    operation: {
        key: -2192240688,
        query: {
            kind: "Document",
            definitions: [
                {
                    kind: "OperationDefinition",
                    operation: "query",
                    name: {
                        kind: "Name",
                        value: "checkStatus",
                    },
                    variableDefinitions: [],
                    directives: [],
                    selectionSet: {
                        kind: "SelectionSet",
                        selections: [
                            {
                                kind: "Field",
                                name: {
                                    kind: "Name",
                                    value: "inputs",
                                },
                                arguments: [],
                                directives: [],
                                selectionSet: {
                                    kind: "SelectionSet",
                                    selections: [
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "totalCount",
                                            },
                                            arguments: [],
                                            directives: [],
                                        },
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "__typename",
                                            },
                                            _generated: true,
                                        },
                                    ],
                                },
                            },
                            {
                                kind: "Field",
                                name: {
                                    kind: "Name",
                                    value: "vouchers",
                                },
                                arguments: [],
                                directives: [],
                                selectionSet: {
                                    kind: "SelectionSet",
                                    selections: [
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "totalCount",
                                            },
                                            arguments: [],
                                            directives: [],
                                        },
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "__typename",
                                            },
                                            _generated: true,
                                        },
                                    ],
                                },
                            },
                            {
                                kind: "Field",
                                name: {
                                    kind: "Name",
                                    value: "reports",
                                },
                                arguments: [],
                                directives: [],
                                selectionSet: {
                                    kind: "SelectionSet",
                                    selections: [
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "totalCount",
                                            },
                                            arguments: [],
                                            directives: [],
                                        },
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "__typename",
                                            },
                                            _generated: true,
                                        },
                                    ],
                                },
                            },
                            {
                                kind: "Field",
                                name: {
                                    kind: "Name",
                                    value: "notices",
                                },
                                arguments: [],
                                directives: [],
                                selectionSet: {
                                    kind: "SelectionSet",
                                    selections: [
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "totalCount",
                                            },
                                            arguments: [],
                                            directives: [],
                                        },
                                        {
                                            kind: "Field",
                                            name: {
                                                kind: "Name",
                                                value: "__typename",
                                            },
                                            _generated: true,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
            loc: {
                start: 0,
                end: 155,
            },
        },
        variables: {},
        kind: "query",
        context: {
            url: "https://honeypot.sepolia.rollups.staging.cartesi.io/graphql",
            requestPolicy: "network-only",
            suspense: false,
            meta: {
                cacheOutcome: "miss",
            },
        },
    },
    hasNext: false,
};
