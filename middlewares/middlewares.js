const _ = require('lodash');
const config = require('../config/config');

module.exports = {
  isValidDomain: (req, res, done) => {
    if (_.includes(config.DOMAINS_WHITE_LIST, req.headers.origin || req.headers.host)) {
      return done();
    }
    return res.send(404, {
      error: 'err-invalid-origin-domain',
      origin: req.headers.origin || req.headers.host
    });
  }
};