const TasksController = require('./tasks.controller');
const middlewares = require('../../middlewares/middlewares');

module.exports = fastify => {
  fastify.get('/tasks', TasksController.list);
  fastify.post('/tasks', { preValidation: middlewares.isValidDomain }, TasksController.create);
  fastify.get('/tasks/:id', { preValidation: middlewares.isValidDomain }, TasksController.read);
  fastify.put('/tasks/:id', { preValidation: middlewares.isValidDomain }, TasksController.update);
  fastify.put('/tasks/:id/title', { preValidation: middlewares.isValidDomain }, TasksController.updateTitle);
  fastify.put('/tasks/:id/completed', { preValidation: middlewares.isValidDomain }, TasksController.updateCompleted);
  fastify.put('/tasks/:id/images', { preValidation: middlewares.isValidDomain }, TasksController.updateImages);
  fastify.delete('/tasks/:id', { preValidation: middlewares.isValidDomain }, TasksController.delete);
};


