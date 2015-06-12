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
NODE_TLS_REJECT_UNAUTHORIZED
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
