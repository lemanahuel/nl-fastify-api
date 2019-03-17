const config = require('./config/config');
const fastify = require('fastify')({ logger: true });
const helmet = require('fastify-helmet');
const static = require('fastify-static');
const routes = require('fastify-routes');
const formbody = require('fastify-formbody');
const cors = require('fastify-cors');
const fileUpload = require('fastify-file-upload');
const pointOfView = require('point-of-view');
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
});
fastify.register(formbody);
fastify.register(cors);
fastify.register(routes);
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
        let endpoints = [];

        fastify.routes.forEach(item => {
          _.mapValues(item, endpoint => {
            endpoints.push({
              path: endpoint.url,
              method: endpoint.method
            });
          });
        });

        reply.view('/public/docs/docs.html', {
          app: {
            title: 'Probando templates en Fastify con Point of View y Mustache'
          },
          endpoints: endpoints
        })
      });

      fastify.listen(config.PORT, '0.0.0.0', err => {
        if (err) {
          fastify.log.error(err);
          // process.exit(1);
          return;
        }
        fastify.log.info(`FASTIFY-API server started on ${config.PORT}`);
      });
    });
  });
})();