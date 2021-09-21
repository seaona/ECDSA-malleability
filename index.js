const EC = require('elliptic').ec;

// Create and initialize EC context
const ec = new EC('secp256k1');

// Generate keys
const key = ec.genKeyPair();

console.log(ec)
//console.log(key)
// Sign the message's hash (input must be an array, or a hex-string)
const msgHash = "68656c6c6f207468697320697320612074657374206578616d706c652c206f662061206d65737361676520666f72207369676e696e672e"
const signature = key.sign(msgHash);

//  {r, s} both that value and {r, -s mod n} are valid.
console.log("=============================FIRST STEP: SIGNATURE")
console.log("Signature r and s values")
signature.s = signature.s.neg().mod(ec.n)
//console.log("s", signature.s*1)
console.log(signature)


// Avoided by picking a particular form as canonical and rejecting the other form(s); 
//in the of the LOW_S rule, the smaller of the 2 possible S values is used.
// https://github.com/bitcoin/bitcoin/pull/6769


// https://github.com/bitcoin/bitcoin/pull/5713/commits/80ad135a5e54e8a065fee5ef36e57034679111ab

// Export DER encoded signature in Array
// Distinguished Encoding Rules (DER) encoding of ASN.1.
const derSign = signature.toDER();


console.log("=============================SECOND STEP: DER ENCODING")
console.log("DER Signature")
console.log(derSign)


// The first flaw is that the original Bitcoin implementation used OpenSSL to verify the DER-encoded ASN.1 transaction data. 
// However, OpenSSL did not do strict validation of the ASN.1 data by default. For instance, OpenSSL would ignore extra padding in the data. 

console.log("=============================THIRD STEP: SIGNATURE VALIDATION")
// Verify signature
console.log(`Signature verified ${key.verify(msgHash, derSign)}`);

