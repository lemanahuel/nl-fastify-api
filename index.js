const config = require('./config/config');
const fastify = require('fastify')({ logger: true });
const helmet = require('fastify-helmet');
const static = require('fastify-static');
const fileUpload = require('fastify-file-upload');
const pointOfView = require('point-of-view');
const Mustache = require('mustache');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const db = require('./integrations/mongodb');

db.connect();

fastify.register(helmet);

fastify.register(fileUpload, {
  limits: { fileSize: 50 * 1024 * 1024 },
});

fastify.register(pointOfView, {
  engine: {
    mustache: require('mustache')
  }
})

fastify.register(static, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
});

(async function init() {
  glob('./modules/**/*.routes.js', {}, (err, files) => {
    async.each(files, (file, cb) => {
      require(path.resolve(file))(fastify);
      cb(null);
    }, err => {
      fastify.get('/statics', (req, reply) => {
        reply.sendFile('static.html');
      });
      fastify.get('/', (req, reply) => {
        reply.redirect('/docs');
      });
      fastify.get('/docs', (req, reply) => {
        reply.view('/public/docs/docs.html', {
          app: {
            title: 1
          },
          endpoints: []
        })
      });

      fastify.listen(config.PORT, err => {
        if (err) {
          fastify.log.error(err);
          process.exit(1);
          return;
        }
        fastify.log.info(`FASTIFY-API server started on ${fastify.server.address().port}`);
      });
    });
  });
})();