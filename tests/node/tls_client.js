process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

require('http2').get('https://localhost/', function(response) {
  response.pipe(process.stdout);
});

