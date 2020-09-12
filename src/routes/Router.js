const express = require('express');
const ucfirst = require('ucfirst');
const fs = require('fs');
const JWT = require('../middleware/jwt-gen');

const dir_controllers = `${__dirname}/../controllers`;
const router_default = '/api/:controller/';
class Router {

    router = null;
    express = null;

    constructor() {
        this.router = express.Router();
        this.express = express();
    }

    validate(req) {
        try {
            if (!fs.existsSync(`${dir_controllers}/${ucfirst(req.params.controller)}Controller.js`)) {
                throw `Rota ${dir_controllers}/${ucfirst(req.params.controller)}Controller.js nao existe`;
            }
        } catch (e) {
            throw e;
        }
    }

    controller(req) {
        const controller = require(`${dir_controllers}/${ucfirst(req.params.controller)}Controller`)
        return new controller();
    }

    async go() {
        // JWT.verify,
        this.express.get(router_default, function(req, res, next) {
            try {
                const r = new Router();
                r.validate(req)
                r.controller(req).get(req, res, next);
            } catch (e) {
                throw e;
            }
        });

        this.express.post(router_default, JWT.verify, (req, res, next) => {
            try {
                const r = new Router();
                r.validate(req)
                r.controller(req).post(req, res, next);
            } catch (e) {
                throw e;
            }
        });

        this.express.put(router_default, JWT.verify, (req, res, next) => {
            try {
                const r = new Router();
                r.validate(req)
                r.controller(req).put(req, res, next);
            } catch (e) {
                throw e;
            }
        });

        this.express.delete(`${router_default}/:id`, JWT.verify, (req, res, next) => {
            try {
                const r = new Router();
                r.validate(req)
                r.controller(req).delete(req, res, next);
            } catch (e) {
                throw e;
            }
        });

        this.express.listen(8002, () =>
            console.log(`Example app listening on port 8002!`),
        );

    }
}
module.exports = Router;