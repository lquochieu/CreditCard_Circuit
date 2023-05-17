// SPDX-License-Identifier: GPL-3.0
pragma circom 2.0.0;
include "../../node_modules/circomlib/circuits/mimc.circom";


template Hash(nInputs) {
    signal input in[nInputs];
    signal output out;

    component hasher = MultiMiMC7(nInputs, 91);
    for(var i = 0; i < nInputs; i++) {
        hasher.in[i] <== in[i];
    }
    hasher.k <== 0;
    
    out <== hasher.out;
}