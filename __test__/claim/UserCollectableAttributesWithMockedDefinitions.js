const Claim = require('claim/Claim');

describe('Claim Constructions tests', () => {
  test('Wrong type', () => {
    const identifier = 'myMockedId';
    const value = {
      country: 'DE',
      state: 'Berlin',
      county: 'Berlin',
      city: 'Berlin',
      postalCode: '15123',
      street: 'Ruthllardstr',
      unit: '12',
    };
    try {
      const uca = new Claim(identifier, value);
      expect(uca).toBe('Should not pass here');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe(`${JSON.stringify(value)} is not valid for ${identifier}`);
    }
  });

  test('Get all properties of a String type', () => {
    const properties = Claim.getAllProperties('my:Mocked:Id2');
    expect(properties).toBeInstanceOf(Array);
    expect(properties.length).toBe(1);
    expect(properties[0]).toBe('mocked.Id2');
  });

  test('Creating Claim from a Boolean type', () => {
    const identifier = 'my:Mocked:Id3';
    const value = true;
    const uca = new Claim(identifier, value);
    expect(uca).toBeDefined();
  });
});
