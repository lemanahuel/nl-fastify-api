const _ = require('lodash');
const async = require('async');
const Cloudy = require('../../integrations/cloudinary');
const Sendgrid = require('../../integrations/sendgrid');
const TaskModel = require('./tasks.model');

module.exports = class Tasks {
  static create(req, reply) {
    TaskModel.create(req.body).then(doc => {
      reply.send(doc);
    });
  }

  static list(req, reply) {
    let q = req.query;
    let findParams = { enable: true };
    let queryParams = {};

    if (q.sort) {
      queryParams.sort = q.sort;
    }
    if (q.filter) {
      findParams[_.replace(q.filter, '-', '')] = _.indexOf(q.filter, '-') > -1 ? false : true;
    }
    TaskModel.find(findParams, null, queryParams).lean().exec().then(docs => {
      reply.send(docs);
    });
  }

  static read(req, reply) {
    TaskModel.findById(req.params.id).lean().exec().then(doc => {
      reply.send(doc);
    });
  }

  static update(req, reply) {
    let oldTask = null;
    let newTask = null;

    async.waterfall([wCb => {
      TaskModel.findById(req.params.id).lean().exec((err, doc) => {
        oldTask = doc;
        wCb(null);
      });
    }, wCb => {
      TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true, safe: true }).lean().exec((err, doc) => {
        newTask = doc;
        wCb(null);
      });
    }, wCb => {
      Sendgrid.send({
        oldTask,
        newTask,
        action: 'tarea actualizada'
      }).then(() => {
        wCb(null);
      });
    }], err => {
      reply.send(newTask);
    });
  }

  static updateTitle(req, reply) {
    TaskModel.findByIdAndUpdate(req.params.id, {
      title: req.body.title
    }).lean().exec().then(doc => {
      reply.send(doc);
    });
  }

  static updateCompleted(req, reply) {
    TaskModel.findByIdAndUpdate(req.params.id, {
      completed: req.body.completed
    }).lean().exec().then(doc => {
      reply.send(doc);
    });
  }

  static updateImages(req, reply) {
    let images = null;
    let oldTask = null;
    async.parallel([wCb => {
      Cloudy.uploadImages(req.raw.files, (err, files) => {
        images = files;
        wCb(null);
      });
    }, wCb => {
      TaskModel.findById(req.params.id).select('images').lean().exec((err, doc) => {
        oldTask = doc;
        wCb(null);
      });
    }], err => {
      TaskModel.findByIdAndUpdate(req.params.id, {
        images: _.concat(oldTask.images || [], _.map(images, img => img.url))
      }).lean().exec().then(doc => {
        reply.send(doc);
      });
    });
  }

  static delete(req, reply) {
    // return TaskModel.findByIdAndRemove(req.params.id).lean().exec();
    TaskModel.findByIdAndUpdate(req.params.id, {
      enable: false
    }).lean().exec().then(doc => {
      reply.send(doc);
    });
  }
};