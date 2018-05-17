import distanceBetweenCoordinates from '../src/example';

describe('Test the calculate distance between coordinate function', () => {
  it('should return 167.45 the distance from this two coordinates', () => {
    expect(distanceBetweenCoordinates(-19.81, -43.95, -19.22, -42.48)).toBe(167.45);
  });

  it('should return null, since it is called on wrong type', () => {
    expect(distanceBetweenCoordinates('a', -43.95, -19.22, -42.48)).toBe(null);
  });
});
