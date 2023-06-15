const multer = require('multer');
const DemandController = require('../Controllers/DemandController');
const { verifyJWT } = require('../Utils/functionsJWT');
const multerConfig = require('../Utils/multer');

const DemandsRoutes = (routes) => {
  routes.get('/demand', DemandController.demandGet);
  routes.get('/demand/newest-four', DemandController.newestFourDemandsGet);
  routes.get('/demand/:id', verifyJWT, DemandController.demandId);
  routes.post('/demand/create', DemandController.demandCreate);
  routes.put('/demand/update/:id', verifyJWT, DemandController.demandUpdate);
  routes.put('/demand/sectorupdate/:id', verifyJWT, DemandController.updateSectorDemand);
  routes.put('/demand/forward/:id', verifyJWT, DemandController.forwardDemand);
  routes.put('/demand/toggle/:id', verifyJWT, DemandController.toggleDemand);
  routes.get('/clientsNames', verifyJWT, DemandController.demandGetWithClientsNames);
  routes.put('/demand/create-demand-update/:id', verifyJWT, DemandController.createDemandUpdate);
  routes.put('/demand/update-demand-update/:id', verifyJWT, DemandController.updateDemandUpdate);
  routes.put('/demand/delete-demand-update/:id', verifyJWT, DemandController.deleteDemandUpdate);
  routes.get('/demand/history/:id', verifyJWT, DemandController.history);
  routes.get('/statistic/category', verifyJWT, DemandController.demandsCategoriesStatistic);
  routes.get('/statistic/sector', verifyJWT, DemandController.demandsSectorsStatistic);
  routes.get('/statistic/client', verifyJWT, DemandController.demandsClientsStatistic);
  routes.post('/demand/upload-file/:id', verifyJWT, multer(multerConfig).single('file'), DemandController.uploadFile);
  routes.get('/demand/file/:idFile', verifyJWT, DemandController.getFile);
  routes.get('/demand/byclient/:clientID/:open', verifyJWT, DemandController.demandByClient);
  app.put('/demand/move/:demandId', async (req, res) => {
    try {
      const { demandId } = req.params;
      const { sectorId } = req.body;
  
      const demand = await Demand.findById(demandId);
  
      if (!demand) {
        return res.status(404).json({ error: 'Demand not found' });
      }
  
      demand.sectorHistory.push({
        sectorID: sectorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      await demand.save();
  
      return res.json(demand);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: 'Could not move demand' });
    }
  });
  
};

module.exports = { DemandsRoutes };
