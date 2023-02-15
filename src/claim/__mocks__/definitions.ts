const definitions = [
    {
        identifier: 'civ:Mock:booleans',
        version: '1',
        type: 'Boolean',
        attestable: true,
    },
    {
        identifier: 'civ:Mock:excMax',
        version: '1',
        type: 'Number',
        exclusiveMaximum: true,
        maximum: 20,
    },
    {
        identifier: 'civ:Mock:max',
        version: '1',
        type: 'Number',
        exclusiveMaximum: false,
        maximum: 50,
    },
    {
        identifier: 'civ:Mock:excMax',
        version: '1',
        type: 'Number',
        value: [10, 20, 30],
    },
    {
        identifier: 'civ:Mock:max',
        version: '1',
        type: 'Number',
        exclusiveMinimum: false,
        minimum: 5,
    },
];

export = definitions