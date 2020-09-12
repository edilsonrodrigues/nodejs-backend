const jwt = require('jsonwebtoken');

exports.verify = (req, res, next) => {
    var token = req.headers['x-access-token'];

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) {
            if (err.name === "TokenExpiredError") {
                // vai pro logout!
                return res.status(401).redirect('http://sig.recsodine.com.br/logout');
            } else {
                return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            }
        }

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.uuid;
        next();
    });
}

exports.sign = (key, options) => {
    return jwt.sign(key, process.env.SECRET, { expiresIn: process.env.JWT_EXP_TIME });
}