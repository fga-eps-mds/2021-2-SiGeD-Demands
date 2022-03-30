const { APIClients } = require('./baseService');

const getClients = async (token) => {
  try {
    const clients = await APIClients.get('/clients', {
      headers: { 'x-access-token': token },
    }).then((response) => response.data);
    return clients;
  } catch (err) {
    console.log(err);
    return { error: 'Could not connect to api_clients' };
  }
};

// const sendEmailToClient = async (
//   clientId,
//   subject,
//   text,
//   token,
//   dateString = '',
// ) => {
//   const body = { subject, text, dateString };
//   const response = await APIClients.post(
//     `/clients/send-email/${clientId}`,
//     body,
//     {
//       headers: { 'x-access-token': token },
//     },
//   );
//   return response;
// };

module.exports = {
  getClients,
  // sendEmailToClient,
};
