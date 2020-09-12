require('dotenv').config();

const router = require('./src/routes/Router');

const routerClass = new router();
routerClass.go();