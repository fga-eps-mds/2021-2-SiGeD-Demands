/* const { sendEmailToClient } = require('../Services/Axios/clientService');

 const notifyDemandCreated = async (clientId, demand, token) => {
  const { subject, text } = buildDemandCreatedEmail(demand);
  const response = await sendEmailToClient(clientId, subject, text, token);
  if (response.status !== 200) throw new Error('Unable to send email to client');
  return response;
};

const scheduleDemandComingAlert = async (
  clientId,
  demand,
  token,
  daysBeforeDemand = 3,
) => {
  const date = demand.createdAt;
  date.setHours(date.getHours() - 24 * daysBeforeDemand);
  const { subject, text } = buildAlertDemandComing(demand, daysBeforeDemand);
  const response = await sendEmailToClient(clientId, subject, text, token, date.toString());
  if (response.status !== 200) throw new Error('Unable to send email to client');
  return response;
}; */

const buildDemandCreatedEmail = (demand) => {
  const subject = 'Nova consulta';
  let text = '';
  text += 'Uma nova consulta foi no sistema do SIGED\n';
  text += '\n';
  text += `Nome: ${demand.name}\n`;
  text += `Descrição: ${demand.description}\n`;
  return { subject, text };
};

const buildAlertDemandComing = (demand, daysBeforeDemand) => {
  const subject = 'Sua consulta está próxima';
  let text = '';
  text += `Faltam ${daysBeforeDemand} para sua consulta cadastrada no SIGED\n`;
  text += '\n';
  text += `Nome: ${demand.name}\n`;
  text += `Descrição: ${demand.description}\n`;
  return { subject, text };
};

module.exports = {
  buildAlertDemandComing,
  buildDemandCreatedEmail,
};
