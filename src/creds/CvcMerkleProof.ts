// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash'
import MerkleTools from 'merkle-tools'
import {sha256} from '../lib/crypto';
import {Claim} from '../claim/Claim';
import {services} from '../services';

/**
 * Transforms a list of UCAs into the signature property of the verifiable claims
 */
export class CvcMerkleProof {
    static get PADDING_INCREMENTS() {
        return 16;
    }

    constructor(ucas) {
        const withRandomUcas = CvcMerkleProof.padTree(ucas);
        this.type = 'CvcMerkleProof2018';
        this.merkleRoot = null;
        this.anchor = 'TBD (Civic Blockchain Attestation)';
        this.leaves = CvcMerkleProof.getAllAttestableValue(withRandomUcas);
        this.granted = null;
    }

    async buildMerkleTree(credentialSigner = null) {
        const merkleTools = new MerkleTools();
        const hashes = _.map(this.leaves, n => sha256(n.value));
        merkleTools.addLeaves(hashes);
        merkleTools.makeTree();
        _.forEach(hashes, (hash, idx) => {
            this.leaves[idx].targetHash = hash;
            this.leaves[idx].node = merkleTools.getProof(idx);
        });
        this.leaves = _.filter(this.leaves, el => !(el.identifier === 'cvc:Random:node'));
        this.merkleRoot = merkleTools.getMerkleRoot().toString('hex');

        if (credentialSigner) {
            this.merkleRootSignature = await credentialSigner.sign(this);
        }
    }

    static padTree(nodes) {
        const currentLength = nodes.length;
        const targetLength = currentLength < CvcMerkleProof.PADDING_INCREMENTS ? CvcMerkleProof.PADDING_INCREMENTS
            : _.ceil(currentLength / CvcMerkleProof.PADDING_INCREMENTS) * CvcMerkleProof.PADDING_INCREMENTS;
        const newNodes = _.clone(nodes);
        const secureRandom = services.container.SecureRandom;
        while (newNodes.length < targetLength) {
            newNodes.push(new Claim('cvc:Random:node', secureRandom.wordWith(16)));
        }
        return newNodes;
    }

    static getAllAttestableValue(ucas) {
        let values = [];
        _.forEach(ucas, (uca) => {
            const innerValues = uca.getAttestableValues();
            values = _.concat(values, innerValues);
        });
        return values;
    }
}
