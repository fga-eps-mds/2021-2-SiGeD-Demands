const moment = require('moment-timezone');

export const defaultDateFormat = () => moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss');

export const checkDemandActivated = (demandStatus) => {
  let isActive;
  if (demandStatus === 'true') {
    isActive = true;
  } else if (demandStatus === 'false') {
    isActive = false;
  } else {
    isActive = { $exists: true };
  }
  return isActive;
};

export const checkDifference = (baseList, otherList) => baseList
  .filter((x) => otherList.indexOf(x) === -1);
