var express = require('express');

let appName = 'cliente'
let appId = '63563dfa-5c6c-43d3-9bdb-b2c3a1a4a35d'
let masterKey = '9a547981-4121-4722-ba36-0fdb5e53eca4'
let javascriptKey = '1ee3acf9-5884-44e3-9c43-af2835bfecfd'
let host = 'host';
let port = 8000;
let endpoint = `cliente`;


app = {
  appName,
  appId,
  masterKey,
  javascriptKey,
  serverURL: `${host}:${port}/${endpoint}`
}

var ParseDashboard = require('parse-dashboard');
var parse_dashboard = new ParseDashboard({
  "apps": [app],
  "users": [{
    "user": "user",
    "pass": "senha"
  }]
}, {
    allowInsecureHTTP: true
  });

let app_dashboard = express();
mountPath = `/dashboard`;
app_dashboard.use(mountPath, parse_dashboard);

let httpServer_parse_dashboard = require('http').createServer({}, app_dashboard);
httpServer_parse_dashboard.listen(9000);

console.log('\n################################################################################################')
console.log('SERVER URL:', "http://localhost:9000/dashboard")
console.log('USER:', 'user')
console.log('PAWWORD:', 'senha')
console.log('################################################################################################\n')
