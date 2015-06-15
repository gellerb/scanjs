var crypto = require('crypto');

var shasum = crypto.createHash('sha1');
var shasum = crypto.createHash("sha1");

var md5sum = crypto.createHash("md5");
var md5sum = crypto.createHash('md5');

var sha2sum = crypto.createHash('sha256');

createHash = require('crypto').createHash;

md5Digest = createHash('md5').update('foobar').digest('hex');
console.log(md5Digest);

console.log(createHash("sha1").update('foobar').digest('hex'));