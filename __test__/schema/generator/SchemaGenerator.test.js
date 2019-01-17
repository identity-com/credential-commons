const SchemaGenerator = require('../../../src/schemas/generator/SchemaGenerator');

describe('Schema Generator buid sample json tests', () => {
  it('Should create sample json with constraints and random returning higher value than definitions', () => {
    Math.random = function random() {
      return 99;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:date',
      version: '1',
      type: {
        properties: [{
          name: 'day',
          type: 'cvc:Type:day',
        },
        {
          name: 'month',
          type: 'cvc:Type:month',
        },
        {
          name: 'year',
          type: 'cvc:Type:year',
        }],
        required: ['day', 'month', 'year'],
      },
    });

    expect(json.day).toBeLessThanOrEqual(31);
    expect(json.day).toBeGreaterThanOrEqual(1);
    expect(json.month).toBeLessThanOrEqual(12);
    expect(json.month).toBeGreaterThanOrEqual(1);
    expect(json.year).toBeGreaterThanOrEqual(1900);
  });

  it('Should create sample json with constraints and random returning value lower than minimum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      minimum: 1,
    });

    expect(json.myCustomType).toBeGreaterThanOrEqual(1);
  });

  it('Should create sample json with constraints and random returning value lower than exclusiveMinimum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMinimum: 1,
    });

    expect(json.myCustomType).toBeGreaterThan(1);
  });

  it('Should create sample json with constraints and random returning value equals maximum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      maximum: 0,
    });

    expect(json.myCustomType).toBe(0);
  });

  it('Should create sample json with constraints and random returning value equals exclusiveMaximum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMaximum: 0,
    });

    expect(json.myCustomType).toBe(-0.1);
  });
});
