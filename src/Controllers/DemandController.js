const mongoose = require('mongoose');
const moment = require('moment-timezone');
const fs = require('fs');
const pathR = require('path');
const Demand = require('../Models/DemandSchema');
const Category = require('../Models/CategorySchema');
const validation = require('../Utils/validate');
const { getClients } = require('../Services/Axios/clientService');
const { getUser } = require('../Services/Axios/userService');
const { verifyChanges } = require('../Utils/verifyChanges');
const File = require('../Models/FileSchema');

/* const {
  notifyDemandCreated,
  scheduleDemandComingAlert,
} = require('../Utils/mailer'); */

const demandGetWithClientsNames = async (req, res) => {
  try {
    const token = req.headers['x-access-token'];
    const { open } = req.query;
    const demandsWithClients = [];
    let demands;
    const clients = await getClients(token);

    if (clients.error) {
      return res.status(400).json({ err: clients.error });
    }
    
    if (open === 'false') {
      demands = await Demand.find({ open }).populate('categoryID');
    } else if (open === 'null') {
      demands = await Demand.find({
        $or: [
          { open: false },
          { open: true },
        ],
      }).populate('categoryID');
    } else {
      demands = await Demand.find({ open: true }).populate('categoryID');
    }

    clients.map((client) => {
      demands.map((demand) => {
        if (client._id === demand.clientID) {
          const demandWithClient = {
            _id: demand._id,
            clientName: client.name,
            name: demand.name,
            categoryID: demand.categoryID,
            open: demand.open,
            description: demand.description,
            process: demand.process,
            sectorHistory: demand.sectorHistory,
            clientID: demand.clientID,
            userID: demand.userID,
            createdAt: demand.createdAt,
            updatedAt: demand.updatedAt,
            updateList: demand.updateList,
          };
          demandsWithClients.push(demandWithClient);
          return true;
        }
        return false;
      });
      return false;
    });
    return res.json(demandsWithClients);
  } catch {
    return res.status(400).json({ err: 'Could not get demands' });
  }
};

const demandGet = async (req, res) => {
  const { open } = req.query;
  if (open === 'false') {
    const demands = await Demand.find({ open }).populate('categoryID');
    return res.json(demands);
  }
  if (open === 'true') {
    const demands = await Demand.find({ open: true }).populate('categoryID');
    return res.json(demands);
  }
  const demands = await Demand.find().populate('categoryID');
  return res.json(demands);
};

const demandsClientsStatistic = async (req, res) => {
  const {
    isDemandActive, idSector, idCategory, initialDate, finalDate, idClients,
  } = req.query;
  let isActive;
  if (isDemandActive === 'true') {
    isActive = true;
  } else if (isDemandActive === 'false') {
    isActive = false;
  } else {
    isActive = { $exists: true };
  }
  const completeFinalDate = `${finalDate}T24:00:00`;

  const aggregatorOpts = [
    {
      $group: {
        _id: '$clientID',
        demandas: { $sum: 1 },
      },
    },
  ];

  try {
    if (idSector && idSector !== 'null' && idSector !== 'undefined') {
      if (idCategory && idCategory !== 'null' && idCategory !== 'undefined') {
        const categoryId = mongoose.Types.ObjectId(idCategory);
        aggregatorOpts.unshift({
          $match: {
            open: isActive,
            sectorID: idSector,
            categoryID: categoryId,
            createdAt: {
              $gte: new Date(initialDate),
              $lte: new Date(completeFinalDate),
            },
          },
        });
      } else {
        aggregatorOpts.unshift({
          $match: {
            open: isActive,
            sectorID: idSector,
            createdAt: {
              $gte: new Date(initialDate),
              $lte: new Date(completeFinalDate),
            },
          },
        });
      }
      aggregatorOpts.unshift({
        $addFields: {
          sectorID: { $arrayElemAt: ['$sectorHistory.sectorID', -1] },
        },
      });
    } else if (
      idCategory
      && idCategory !== 'null'
      && idCategory !== 'undefined'
    ) {
      const categoryId = mongoose.Types.ObjectId(idCategory);
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          categoryID: categoryId,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    } else {
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    }
  } catch (err) {
    console.error(err);
  }

  if (idClients && idClients !== 'null' && idClients !== 'undefined') {
    try {
      const clientID = String(idClients);
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          clientID,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    } catch (err) {
      console.error(err.message);
    }
  }
  try {
    const statistics = await Demand.aggregate(aggregatorOpts).exec();
    return res.json(statistics);
  } catch {
    return res.status(400).json({ err: 'failed to generate statistics' });
  }
};

const demandsCategoriesStatistic = async (req, res) => {
  const {
    isDemandActive, idSector, idCategory, initialDate, finalDate, idClients,
  } = req.query;

  let isActive;
  if (isDemandActive === 'true') {
    isActive = true;
  } else if (isDemandActive === 'false') {
    isActive = false;
  } else {
    isActive = { $exists: true };
  }
  const completeFinalDate = `${finalDate}T24:00:00`;

  const aggregatorOpts = [
    { $unwind: '$categoryID' },
    {
      $lookup: {
        from: Category.collection.name,
        localField: 'categoryID',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $group: {
        _id: '$categoryID',
        categories: { $first: '$categories' },
        demandas: { $sum: 1 },
      },
    },
  ];
  
  try {
    if (idSector && idSector !== 'null' && idSector !== 'undefined') {
      if (idCategory && idCategory !== 'null' && idCategory !== 'undefined') {
        const categoryId = mongoose.Types.ObjectId(idCategory);
        aggregatorOpts.unshift({
          $match: {
            open: isActive,
            sectorID: idSector,
            categoryID: categoryId,
            createdAt: {
              $gte: new Date(initialDate),
              $lte: new Date(completeFinalDate),
            },
          },
        });
      } else {
        aggregatorOpts.unshift({
          $match: {
            open: isActive,
            sectorID: idSector,
            createdAt: {
              $gte: new Date(initialDate),
              $lte: new Date(completeFinalDate),
            },
          },
        });
      }
      aggregatorOpts.unshift({
        $addFields: {
          sectorID: { $arrayElemAt: ['$sectorHistory.sectorID', -1] },
        },
      });
    } else if (
      idCategory
      && idCategory !== 'null'
      && idCategory !== 'undefined'
    ) {
      const categoryId = mongoose.Types.ObjectId(idCategory);
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          categoryID: categoryId,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    } else {
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    }
  } catch (err) {
    console.error(err);
  }

  if (idClients && idClients !== 'null' && idClients !== 'undefined') {
    try {
      const clientID = String(idClients);
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          clientID,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    } catch (err) {
      console.error(err.message);
    }
  }

  try {
    const statistics = await Demand.aggregate(aggregatorOpts).exec();
    return res.json(statistics);
  } catch {
    return res.status(400).json({ err: 'failed to generate statistics' });
  }
};

// const demandsSectorsStatistic = async (req, res) => {
//   const {
//     isDemandActive, idSector, idCategory, initialDate, finalDate, idClients,
//   } = req.query;

//   let isActive;
//   if (isDemandActive === 'true') {
//     isActive = true;
//   } else if (isDemandActive === 'false') {
//     isActive = false;
//   } else {
//     isActive = { $exists: true };
//   }
//   const completeFinalDate = `${finalDate}T24:00:00`;

//   const aggregatorOpts = [
//     {
//       $group: {
//         _id: { $last: '$sectorHistory.sectorID' },
//         total: { $sum: 1 },
//       },
//     },
//   ];
  
//   try {
//     if (idSector && idSector !== 'null' && idSector !== 'undefined') {
//       if (idCategory && idCategory !== 'null' && idCategory !== 'undefined') {
//         const categoryId = mongoose.Types.ObjectId(idCategory);
//         aggregatorOpts.unshift({
//           $match: {
//             open: isActive,
//             sectorID: idSector,
//             categoryID: categoryId,
//             createdAt: {
//               $gte: new Date(initialDate),
//               $lte: new Date(completeFinalDate),
//             },
//           },
//         });
//       } else {
//         aggregatorOpts.unshift({
//           $match: {
//             open: isActive,
//             sectorID: idSector,
//             createdAt: {
//               $gte: new Date(initialDate),
//               $lte: new Date(completeFinalDate),
//             },
//           },
//         });
//       }
//       aggregatorOpts.unshift({
//         $addFields: {
//           sectorID: { $arrayElemAt: ['$sectorHistory.sectorID', -1] },
//         },
//       });
//     } else if (
//       idCategory
//       && idCategory !== 'null'
//       && idCategory !== 'undefined'
//     ) {
//       const categoryId = mongoose.Types.ObjectId(idCategory);
//       aggregatorOpts.unshift({
//         $match: {
//           open: isActive,
//           categoryID: categoryId,
//           createdAt: {
//             $gte: new Date(initialDate),
//             $lte: new Date(completeFinalDate),
//           },
//         },
//       });
//     } else {
//       aggregatorOpts.unshift({
//         $match: {
//           open: isActive,
//           createdAt: {
//             $gte: new Date(initialDate),
//             $lte: new Date(completeFinalDate),
//           },
//         },
//       });
//     }
//   } catch (err) {
//     console.error(err);
//   }

//   if (idClients && idClients !== 'null' && idClients !== 'undefined') {
//     try {
//       const clientID = String(idClients);
//       aggregatorOpts.unshift({
//         $match: {
//           open: isActive,
//           clientID,
//           createdAt: {
//             $gte: new Date(initialDate),
//             $lte: new Date(completeFinalDate),
//           },
//         },
//       });
//     } catch (err) {
//       console.error(err.message);
//     }
//   }

//   try {
//     const statistics = await Demand.aggregate(aggregatorOpts).exec();
//     console.log(statistics);
//     return res.json(statistics);
//   } catch (err) {
//     return res.status(400).json({ err: 'failed to generate statistics' });
//   }
// };

const demandsSectorsStatistic = async (req, res) => {
  const {
    isDemandActive, idSector, idCategory, initialDate, finalDate, idClients,
  } = req.query;

  let isActive;
  if (isDemandActive === 'true') {
    isActive = true;
  } else if (isDemandActive === 'false') {
    isActive = false;
  } else {
    isActive = { $exists: true };
  }
  const completeFinalDate = `${finalDate}T24:00:00`;

  const aggregatorOpts = [
    {
      $group: {
        _id: { $last: '$categoryID' },
        total: { $sum: 1 },
      },
    },
  ];

  try {
    // Match by sectorID if idSector is provided
    if (idSector && idSector !== 'null' && idSector !== 'undefined') {
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          sectorID: idSector,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    }

    // Match by categoryID if idCategory is provided
    if (idCategory && idCategory !== 'null' && idCategory !== 'undefined') {
      const categoryId = mongoose.Types.ObjectId(idCategory);
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          categoryID: categoryId,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    }

    // Match by clientID if idClients is provided
    if (idClients && idClients !== 'null' && idClients !== 'undefined') {
      const clientID = String(idClients);
      aggregatorOpts.unshift({
        $match: {
          open: isActive,
          clientID,
          createdAt: {
            $gte: new Date(initialDate),
            $lte: new Date(completeFinalDate),
          },
        },
      });
    }

    // Execute the aggregation pipeline and retrieve the statistics
    const statistics = await Demand.aggregate(aggregatorOpts).exec();
    console.log(statistics);
    return res.json(statistics);
  } catch (err) {
    return res.status(400).json({ err: 'failed to generate statistics' });
  }
};

const demandCreate = async (req, res) => {
  try {
    const {
      name,
      description,
      process,
      categoryID,
      sectorID,
      clientID,
      userID,
      demandDate,
    } = req.body;

    const validFields = validation.validateDemand(
      name,
      description,
      categoryID,
      sectorID,
      clientID,
      userID,
    );
    if (validFields.length) {
      return res.status(400).json({ status: validFields });
    }
    const token = req.headers['x-access-token'];

    const user = await getUser(userID, token);

    if (user.error) {
      return res.status(400).json({ message: user.error });
    }
    const date = moment
      .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
      .toDate();
    const retroactiveDate = moment(demandDate).toDate();
    retroactiveDate.setHours(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    );

    const newDemand = await Demand.create({
      name,
      description,
      process: process || '',
      categoryID,
      sectorHistory: {
        sectorID,
        createdAt: date,
        updatedAt: date,
      },
      clientID,
      userID,
      demandHistory: {
        userID,
        date,
        label: 'created',
      },
      createdAt: demandDate ? retroactiveDate : date,
      updatedAt: date,
    });

    await notifyDemandCreated(clientID, newDemand, token);
    await scheduleDemandComingAlert(clientID, newDemand, token);

    return res.json(newDemand);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: 'Failed to create demand' });
  }
};

const demandUpdate = async (req, res) => {
  const { id } = req.params;
  const {
    name, description, process, categoryID, sectorID, clientID, userID,
  } = req.body;

  const validFields = validation.validateDemand(
    name,
    description,
    categoryID,
    sectorID,
    clientID,
    userID,
  );

  if (validFields.length) {
    return res.status(400).json({ status: validFields });
  }

  try {
    const token = req.headers['x-access-token'];

    const user = await getUser(userID, token);

    if (user.error) {
      return res.status(400).json({ message: user.error });
    }

    const demandHistory = await verifyChanges(req.body, id);
    const updateStatus = await Demand.findOneAndUpdate(
      { _id: id },
      {
        name,
        description,
        process,
        categoryID,
        sectorID,
        clientID,
        userID,
        demandHistory,
        updatedAt: moment
          .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
          .toDate(),
      },
      { new: true },
      (err) => err,
    );
    return res.json(updateStatus);
  } catch {
    return res.status(400).json({ err: 'invalid id' });
  }
};

const toggleDemand = async (req, res) => {
  const { id } = req.params;

  try {
    const demandFound = await Demand.findOne({ _id: id });

    let { open } = demandFound;

    open = !demandFound.open;

    const updateStatus = await Demand.findOneAndUpdate(
      { _id: id },
      {
        open,
        updatedAt: moment
          .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
          .toDate(),
      },
      { new: true },
      (demand) => demand,
    );
    return res.json(updateStatus);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const demandByClient = async (req, res) => {
  const { clientID, open } = req.params;

  try {
    const demand = await Demand.find({ clientID: clientID, open: open }).populate('categoryID');
    return res.status(200).json(demand);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const demandId = async (req, res) => {
  const { id } = req.params;
  try {
    const demand = await Demand.findOne({ _id: id }).populate('categoryID');
    return res.status(200).json(demand);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const updateSectorDemand = async (req, res) => {
  const { id } = req.params;

  const { sectorID } = req.body;

  const validFields = validation.validateSectorID(sectorID);

  if (validFields.length) {
    return res.status(400).json({ status: validFields });
  }

  try {
    const demandFound = await Demand.findOne({ _id: id });

    demandFound.sectorHistory[demandFound.sectorHistory.length - 1].sectorID = sectorID;

    demandFound.sectorHistory[demandFound.sectorHistory.length - 1].updatedAt = moment
      .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
      .toDate();

    const updateStatus = await Demand.findOneAndUpdate(
      { _id: id },
      {
        sectorHistory: demandFound.sectorHistory,
        updatedAt: moment
          .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
          .toDate(),
      },
      { new: true },
      (user) => user,
    );
    return res.json(updateStatus);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const forwardDemand = async (req, res) => {
  const { id } = req.params;

  const { sectorID } = req.body;

  const validField = validation.validateSectorID(sectorID);

  if (validField.length) {
    return res.status(400).json({ status: validField });
  }

  try {
    const demandFound = await Demand.findOne({ _id: id });

    demandFound.sectorHistory = demandFound.sectorHistory.push({
      sectorID,
      createdAt: moment
        .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
        .toDate(),
      updatedAt: moment
        .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
        .toDate(),
    });

    const updateStatus = await Demand.findOneAndUpdate(
      { _id: id },
      {
        sectorHistory: demandFound.sectorHistory,
      },
      { new: true },
      (user) => user,
    );
    return res.json(updateStatus);
  } catch (error) {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const createDemandUpdate = async (req, res) => {
  const { id } = req.params;

  const {
    userName,
    userSector,
    userID,
    description,
    visibilityRestriction,
    important,
  } = req.body;

  const validFields = validation.validateDemandUpdate(
    userName,
    description,
    visibilityRestriction,
    userSector,
    userID,
    important,
  );

  if (validFields.length) {
    return res.status(400).json({ status: validFields });
  }

  try {
    const demandFound = await Demand.findOne({ _id: id });

    demandFound.updateList = demandFound.updateList.push({
      userName,
      userSector,
      userID,
      description,
      visibilityRestriction,
      important,
      createdAt: moment
        .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
        .toDate(),
      updatedAt: moment
        .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
        .toDate(),
    });

    const updateStatus = await Demand.findOneAndUpdate(
      { _id: id },
      {
        updateList: demandFound.updateList,
      },
      { new: true },
      (user) => user,
    );

    return res.json(updateStatus);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const updateDemandUpdate = async (req, res) => {
  const {
    userName,
    userSector,
    userID,
    description,
    visibilityRestriction,
    updateListID,
    important,
  } = req.body;

  const validFields = validation.validateDemandUpdate(
    userName,
    description,
    visibilityRestriction,
    userSector,
    userID,
    important,
  );

  if (validFields.length) {
    return res.status(400).json({ status: validFields });
  }

  try {
    const final = await Demand.findOneAndUpdate(
      { 'updateList._id': updateListID },
      {
        $set: {
          'updateList.$.userName': userName,
          'updateList.$.userSector': userSector,
          'updateList.$.userID': userID,
          'updateList.$.description': description,
          'updateList.$.visibilityRestriction': visibilityRestriction,
          'updateList.$.important': important,
          'updateList.$.updatedAt': moment
            .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
            .toDate(),
        },
      },
      { new: true },
      (user) => user,
    );
    return res.json(final);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const deleteDemandUpdate = async (req, res) => {
  const { id } = req.params;

  const { updateListID } = req.body;

  try {
    const demand = await Demand.findOne({ _id: id });
    const updateList = demand.updateList.filter(
      (update) => String(update._id) !== updateListID,
    );
    const difference = demand.updateList.filter((x) => updateList.indexOf(x) === -1);
    if (difference[0].fileID.length > 0) {
      const fileID = difference[0].fileID[0];
      const fileObject = await File.findOne({ _id: fileID });
      const pathFile = pathR.resolve(__dirname, '..', '..', 'files', 'uploads', `${fileObject.path}`);
      if (fs.existsSync(pathFile)) {
        fs.unlinkSync(pathFile);
      }
      await File.deleteOne({ _id: fileID });
    }

    const updateStatus = await Demand.findOneAndUpdate(
      { _id: id },
      {
        updateList,
      },
      { new: true },
      (user) => user,
    );
    return res.json(updateStatus);
  } catch (error) {
    return res.status(400).json({ err: 'failure' });
  }
};

const history = async (req, res) => {
  const { id } = req.params;

  try {
    let error = '';
    const token = req.headers['x-access-token'];
    const demandFound = await Demand.findOne({ _id: id });
    const userHistory = await Promise.all(
      demandFound.demandHistory.map(async (elem) => {
        const user = await getUser(elem.userID, token);

        if (user.error) {
          error = user.error;
          return;
        }
        return {
          label: elem.label,
          before: elem.before,
          after: elem.after,
          date: elem.date,
          user: {
            _id: user._id,
            name: user.name,
            sector: user.sector,
            role: user.role,
          },
        };
      }),
    );
    if (error) {
      return res.status(400).json({ message: error });
    }
    return res.json(userHistory);
  } catch {
    return res.status(400).json({ message: 'Demand not found' });
  }
};

const newestFourDemandsGet = async (req, res) => {
  const demands = await Demand.find().limit(4).sort({ createdAt: -1 });

  return res.status(200).json(demands);
};

const getFile = async (req, res) => {
  const { idFile } = req.params;
  try {
    const fileObject = await File.findOne({ _id: idFile });
    let pathFile = pathR.resolve(__dirname, '..', '..', 'files', 'uploads', `${fileObject.path}`);
    if (!fs.existsSync(pathFile)) {
      pathFile = pathR.resolve(__dirname, '..', '..', 'files', 'Error', 'PDF_NOT_FOUND.pdf');
    }
    const file = fs.createReadStream(pathFile);
    res.contentType('application/pdf');
    return file.pipe(res);
  } catch (err) {
    return res.status(400).json({ err: 'Failed to get file.' });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userName,
      userSector,
      userId,
      description,
      important,
      visibility,
    } = req.body;
    const name = req.file.originalname;
    const { size } = req.file;
    const path = req.file.filename;
    const newFile = await File.create({
      name,
      path,
      size,
      demandId: id,
      createdAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
      updatedAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
    });

    const validFields = validation.validateDemandUpdate(
      userName, description, visibility, userSector, userId, important,
    );

    if (validFields.length) {
      return res.status(400).json({ status: validFields });
    }

    const demandFound = await Demand.findOne({ _id: id });

    demandFound.updateList = demandFound.updateList.push({
      userName,
      userSector,
      userId,
      fileID: newFile._id,
      description,
      visibility,
      important,
      createdAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
      updatedAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
    });

    await Demand.findOneAndUpdate({ _id: id }, {
      updateList: demandFound.updateList,
    }, { new: true }, (user) => user);
    return res.json(newFile);
  } catch {
    return res.status(400).json({ err: 'Failed to save file.' });
  }
};

module.exports = {
  demandGet,
  demandCreate,
  demandUpdate,
  toggleDemand,
  demandByClient,
  demandId,
  updateSectorDemand,
  forwardDemand,
  createDemandUpdate,
  demandGetWithClientsNames,
  updateDemandUpdate,
  deleteDemandUpdate,
  demandsCategoriesStatistic,
  demandsSectorsStatistic,
  demandsClientsStatistic,
  history,
  newestFourDemandsGet,
  uploadFile,
  getFile,
};
