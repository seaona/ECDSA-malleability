# ECDSA Malleability
## Setup
Clone the repo and run the script.
```
git clone https://github.com/seaona/ECDSA-malleability
cd ECDSA-malleability
npm ci
node index.js 
```

## Two Valid signatures
The first malleability issue can be found on the process of signing. Here we will illustrate in which step this happens. 

<ins>Note:</ins> for the purposes of this explanation, we will use a small script created with Javascript.

### Generate Key Pair
We will use Elliptic Curves to generate a key pair. The paramaters that we will use are the same as in Bitcoin, secp256k1. 
```
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const key = ec.genKeyPair();
```

### Create a Signature
We will use a random message (in hex-string) and sign it with our keys.

`const signature = key.sign(msgHash);`

The result is going to be an "r" and and "s" value. Since these are really big numbers, JS uses a built in object for representing the values.

![](https://i.imgur.com/DjVgb9a.png)

### Malleability
Here we encounter the first malleability issue. Both results shown, result in valid signatures:
*     {r, s}
*     {r, -s mod n}
As you can see, you can calculate the second case, without having the private key, so one could potentially change the signature to 2.

**Solution:** pick the smaller of the 2 possible s values as canonical. This introduced the LOW_S rule and can be found policy/policy.h

![](https://i.imgur.com/ow4vjvm.png)

### Some context on n, s, r
**n** is defined to be the the order of the secp256k1 group. So it is the number of distinct points in the group, including the infinity point. When you have a number like r or s that is between 0 and n - 1, it is actually the index of a particular point on the curve. It's like a private key (which are between 1 and n - 1), because you can use that number to generate secp256k1 point. The secp256k1 group is isomorphic to the group of integers modulo **n**: adding two such integers is equivalent to adding their corresponding secp256k1 points. The number 0 is equivalent to the infinity point.

## DER enconding of ASN.1 and OPENSSL
Once we get the signature, we need to encode it using Disinguished Encoding Rules ([DER](https://en.wikipedia.org/wiki/ASN.1#Example_encoded_in_DER))

`const derSign = signature.toDER();`

![](https://i.imgur.com/amwpxei.png)

### Malleability
The original Bitcoin implementation used OpenSSL to verify the DER-encoded ASN.1 transaction data. 
The problem was that there was no strict validation and some parameters, like extra padding were ignored.
This padding would change the transaction hash, without invalidating it.

**Solution**: this is fixed with the [BIP66](https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki) implementation.
