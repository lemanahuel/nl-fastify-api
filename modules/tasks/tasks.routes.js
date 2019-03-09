const TasksController = require('./tasks.controller');
const middlewares = require('../../middlewares/middlewares');

module.exports = server => {
  server.get('/tasks', TasksController.list);
  server.post('/tasks', { preValidation: middlewares.isValidDomain }, TasksController.create);
  server.get('/tasks/:id', { preValidation: middlewares.isValidDomain }, TasksController.read);
  server.put('/tasks/:id', { preValidation: middlewares.isValidDomain }, TasksController.update);
  server.put('/tasks/:id/title', { preValidation: middlewares.isValidDomain }, TasksController.updateTitle);
  server.put('/tasks/:id/completed', { preValidation: middlewares.isValidDomain }, TasksController.updateCompleted);
  server.put('/tasks/:id/images', { preValidation: middlewares.isValidDomain }, TasksController.updateImages);
  server.delete('/tasks/:id', { preValidation: middlewares.isValidDomain }, TasksController.delete);
};


