const definitions = [
  {
    identifier: 'civ:cred:Test',
    version: '1',
    depends: [
      'civ:Identity:name',
      'civ:Identity:DateOfBirth',
    ],
    exclude: [
      'civ:Identity:name.middle',
    ],
  },
];

export default definitions;
