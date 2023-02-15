const { services, initServices } = require('services/index');
const httpMock = require('services/__mocks__/httpService');

describe('Services Container  Tests', () => {
  test('Has HTTP Service', () => {
    const http = services.container.Http;
    expect(http).toBeDefined();
  });
  test('Has Anchor Service', () => {
    const anchorService = services.container.AnchorService;
    expect(anchorService).toBeDefined();
  });
  test('Has Config Service', () => {
    const config = services.container.Config;
    expect(config).toBeDefined();
  });
  test('Override HTTP Service', () => {
    expect(httpMock).toBeDefined();
    initServices(null, httpMock);
    const http = services.container.Http;
    expect(http).toBeDefined();
    expect(http.name).toBe('mockHttp');
  });
  test('Override Config Service', () => {
    initServices({ test: '' }, null);
    const http = services.container.Http;
    expect(http).toBeDefined();
    // TODO cannot branch out the IFs to cover all code this is strange
    expect(http.name).toBe('mockHttp');
  });
});
