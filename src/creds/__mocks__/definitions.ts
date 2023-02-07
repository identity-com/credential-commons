export const definitions = [
    {
        identifier: 'civ:Credential:SimpleIdentity',
        version: '1',
        depends: [
            'civ:Identity:name',
            'civ:Identity:DateOfBirth',
        ],
    },
    {
        identifier: 'civ:Credential:SimpleTest',
        version: '1',
        depends: [
            'civ:Identity:name',
            'civ:Identity:DateOfBirth',
        ],
    },
    {
        identifier: 'civ:Credential:TestWithExcludes',
        version: '1',
        depends: [
            'civ:Identity:name',
            'civ:Identity:DateOfBirth',
        ],
        excludes: [
            'civ:Identity:name.middle',
        ],
    },
];