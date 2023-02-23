import {DIDDocument, DIDResolutionResult, Resolver, ResolverRegistry} from "did-resolver";

export interface IDiDResolver {
  resolve(did: string): Promise<DIDDocument | null>;
}

class DiDResolver implements IDiDResolver {
  private resolver: Resolver;

  constructor(didMethods: ResolverRegistry) {
    this.resolver = new Resolver({...didMethods})
  }

  resolve(did: string): Promise<DIDDocument | null> {
    return this.resolver.resolve(did)
      .then((DiDResolutionResult: DIDResolutionResult) => DiDResolutionResult.didDocument)
  }
}

export {
  DiDResolver
}
