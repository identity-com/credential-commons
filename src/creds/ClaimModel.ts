import _ from 'lodash';

interface UCA {
    getClaimRootPropertyName(): string

    getClaimPropertyName(): string

    getPlainValue(): object
}

/**
 * Transforms a list of UCAs into the claim property of the verifiable cliams
 */

interface ClaimComponent {
    [key: string]: object
}

export class ClaimModel {
    [key: string]: ClaimComponent | object;

    constructor(ucas: Array<UCA>) {
        _.forEach(ucas, (uca) => {
            const rootPropertyName = uca.getClaimRootPropertyName();
            if (!_.isEmpty(rootPropertyName)) {
                if (!this[rootPropertyName]) {
                    this[rootPropertyName] = {};
                }

                (this[rootPropertyName] as ClaimComponent)[uca.getClaimPropertyName()] = uca.getPlainValue();
            } else {
                this[uca.getClaimPropertyName()] = uca.getPlainValue();
            }
        });
    }
}