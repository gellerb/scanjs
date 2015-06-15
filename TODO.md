## TODO

### Implement

* Weak Hash Detection
```js
createHash('md5')
createHash("md5")
createHash('sha1')
createHash("sha1")
```

* node-curl - Disabled SSL Verification
```js
SSL_VERIFYPEER : 0
```


* Remote OS Command Execution
```js
child_process.exec()
```

* Detect Self-Signed Certificates
```js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
```
* Below source rule matches both `foo.bar.flag=0` & `foo.bar.flag=1`
```js
  {
    "name": "self signed cert",
    "source": "process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'",
    "testhit": "require('child_process').exec;",
    "testmiss": "",
    "desc": "TODO",
    "threat": ""
  }
```

* Handlebars
```js
handlebars.compile(content, {noEscape: true})
```
```js
new Handlebars.SafeString('<div>HTML Content!</div>')
```
```js
<p>{{{content}}}</p>
```
* Mongoose - Disabled SSL Certificate Verification
```
var mongoose = require('mongoose');
var options = {
    server: {sslValidate: false}
}
```
