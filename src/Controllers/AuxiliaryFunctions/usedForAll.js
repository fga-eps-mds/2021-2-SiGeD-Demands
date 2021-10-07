const moment = require('moment-timezone');

export const defaultDateFormat = () => moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss');
