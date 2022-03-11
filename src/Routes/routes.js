const express = require('express');
const { CategoriesRoutes } = require('./categories.routes');
const { DemandsRoutes } = require('./demands.routes');
const { AlertsRoutes } = require('./alerts.routes');

const routes = express.Router();

CategoriesRoutes(routes);
DemandsRoutes(routes);
AlertsRoutes(routes);

module.exports = routes;
