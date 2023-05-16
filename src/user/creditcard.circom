// SPDX-License-Identifier: GPL-3.0
pragma circom 2.0.0;
include "../libs/hash.circom";
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
    
    - userInfoHashed: hash(creditCardNumber, creditCardExpireDate, creditCardCreationDate, cvv, bank, ownerName)
    Public input:
    - ownerName
    - availableTime
    - key
    - root

*/
template CreadiCardVerifier(nSiblings) {
    signal input creditCardNumber;
    signal input creditCardExpireDate;
    signal input creditCardCreationDate;

    signal input cvv;
    signal input bank;

    signal input ownerName;
    
    signal input userInfoHashed;
    
    signal input availableTime;

    var i;

    component leaf = Hash(6);
    leaf.in[0] <== creditCardNumber;
    leaf.in[1] <== creditCardExpireDate;
    leaf.in[2] <== creditCardCreationDate;
    leaf.in[3] <== cvv;
    leaf.in[4] <== bank;
    leaf.in[5] <== ownerName;

    userInfoHashed === leaf.out;

    component gte = GreaterEqThan(252);
    gte.in[0] <== creditCardExpireDate * 100;
    gte.in[1] <== availableTime;

    gte.out === 1;
}

component main{public[userInfoHashed, ownerName, availableTime]} = CreadiCardVerifier(32);
