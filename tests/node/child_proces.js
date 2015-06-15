child_process = require('child_process');

var user_input = '*.js';

child_process.exec('ls -l ' + user_input, function (err, data) {
    console.log(data);
});

var exec = require('child_process').exec;

exec('ls -l ' + user_input, function (err, data) {
    console.log(data);
});

// False positives if rule created for foo.exec()
var myRe = /d(b+)d/;
var myArray = myRe.exec("cdbbdbsbz");