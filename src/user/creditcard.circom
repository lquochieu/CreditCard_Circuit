// SPDX-License-Identifier: GPL-3.0
pragma circom 2.0.0;
include "../libs/merkletree/fmthash.circom";
include "../libs/merkletree/fmtverifier.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
/*
    This circuit is used to proof user is credit card owner
    Inputs:
    - creditCardNumber: 
    - creditCardExpireDate: card's expire time
    - creditCardCreationDate
    - cvv
    - bank: bank name
    
    - ownerName
    
    - key: the index of owner in tree
    - siblings: path from owner's leaf to root
    - root: current root in tree
    Public input:
    - ownerName
    - availableTime
    - key
    - root

*/
template MerkleTreeVerifier(nSiblings) {
    signal input creditCardNumber;
    signal input creditCardExpireDate;
    signal input creditCardCreationDate;

    signal input cvv;
    signal input bank;

    signal input ownerName;
    
    signal input key;
    signal input siblings[nSiblings];
    signal input root;
    
    signal input availableTime;

    var i;

    component leaf = Hash(6);
    leaf.in[0] <== creditCardNumber;
    leaf.in[1] <== creditCardExpireDate;
    leaf.in[2] <== creditCardCreationDate;
    leaf.in[3] <== cvv;
    leaf.in[4] <== bank;
    leaf.in[5] <== ownerName;

    component r = CalculateRootFromSiblings(nSiblings);
    r.key <== key;
    r.in <== leaf.out;
    for(i = 0; i < nSiblings; i++) {
        r.siblings[i] <== siblings[i];
    }

    root === r.root;

    component gte = GreaterEqThan(252);
    gte.in[0] <== creditCardExpireDate * 100;
    gte.in[1] <== availableTime;

    gte.out === 1;
}

component main{public[ownerName, availableTime, key, root]} = MerkleTreeVerifier(32);
