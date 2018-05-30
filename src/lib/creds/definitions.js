const definitions = [
  {
    identifier: 'civ:cred:Test',
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

export default definitions;
