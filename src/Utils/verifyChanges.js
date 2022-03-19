const moment = require('moment-timezone');
const Demand = require('../Models/DemandSchema');

const buildHistory = (body, demand, label) => {
  const date = moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate();
  return {
    label,
    before: label === 'process' ? `[${demand[label].join([','])}]` : demand[label],
    after: label === 'process' ? `[${body[label].join([','])}]` : body[label],
    userID: body.userID,
    date,
  };
};

const biggerArray = (arr1, arr2) => {
  if (arr1.length > arr2.length) {
    return { bigger: arr1, smaller: arr2, body: true };
  }
  return { bigger: arr2, smaller: arr1, body: false };
};

const verifyCategoriesListChanged = (body, demand, newHistory) => {
  const date = moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate();
  const categoryArrays = biggerArray(body.categoryID, demand.categoryID);
  categoryArrays.bigger.map((item, index) => {
    const value0 = String(item ?? '');
    const value1 = String(categoryArrays.smaller[index] ?? '');
    if (value0 !== value1) {
      newHistory.push({
        label: 'category',
        before: categoryArrays.body ? value1 : value0,
        after: categoryArrays.body ? value0 : value1,
        userID: body.userID,
        date,
      });
    }
    return item;
  });
};

const verifyInputsChanged = (body, demand, newHistory) => {
  if (body.name !== demand.name) {
    newHistory.push(buildHistory(body, demand, 'name'));
  }
  if (body.description !== demand.description) {
    newHistory.push(buildHistory(body, demand, 'description'));
  }
  if (body.process !== demand.process) {
    newHistory.push(buildHistory(body, demand, 'process'));
  }
};

const verifyChanges = async (body, id) => {
  const demand = await Demand.findOne({ _id: id });
  const newHistory = [];

  verifyInputsChanged(body, demand, newHistory);
  verifyCategoriesListChanged(body, demand, newHistory);

  return [...demand.demandHistory, ...newHistory];
};

module.exports = {
  verifyChanges,
  buildHistory
};
