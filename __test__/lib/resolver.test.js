const {DiDResolver} = require('lib/resolver');
const {DIDResolutionResult} = require("did-resolver");
const didUtil = require('lib/did');

describe("DiDResolver", () => {
    const mockResolveMethod = jest.fn();

    const mockDidMethods = {
        mock: mockResolveMethod
    };

    const didResolver = new DiDResolver(mockDidMethods);

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("resolve", () => {
        it("should resolve a DID", async () => {
            // Assemble
            const mockDID = "did:mock:12345";
            const mockDidDocument = {id: mockDID};
            const mockResolutionResult = {didDocument: mockDidDocument};
            mockResolveMethod.mockResolvedValueOnce(mockResolutionResult);

            // Act
            const resolvedDidDocument = await didResolver.resolve(mockDID);

            // Assert
            expect(mockResolveMethod).toHaveBeenCalledWith(mockDID, expect.anything(), expect.anything(), expect.anything());
            expect(resolvedDidDocument).toEqual(mockDidDocument);
        });

        it("should return null if the DID is not resolved", async () => {
            // Assemble
            const mockDID = "did:mock:12345";
            mockResolveMethod.mockResolvedValueOnce({
                didDocument: null
            });

            // Act
            const resolvedDidDocument = await didResolver.resolve(mockDID);

            // Assert
            expect(mockResolveMethod).toHaveBeenCalledWith(mockDID, expect.anything(), expect.anything(), expect.anything());
            expect(resolvedDidDocument).toBeNull();
        });
    });
});
