const AlertController = require('../Controllers/AlertController');
const { verifyJWT } = require('../Utils/functionsJWT');

const AlertsRoutes = (routes) => {
  routes.post('/alert/create', verifyJWT, AlertController.alertCreate);
  routes.put('/alert/update/:id', verifyJWT, AlertController.alertUpdate);
  routes.delete('/alert/delete/:id', verifyJWT, AlertController.alertDelete);
  routes.get('/alert', verifyJWT, AlertController.alertGet);
  routes.get('/alert/demand/:demandID', verifyJWT, AlertController.alertGetByDemandId);
  routes.get('/alert/sector/:sectorID', verifyJWT, AlertController.alertGetBySectorId);
};

module.exports = { AlertsRoutes };
