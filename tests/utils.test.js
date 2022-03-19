const {buildDemandCreatedEmail, buildAlertDemandComing} = require('../src/Utils/mailer');

const subjectEmail = 'Nova consulta';
const textEmail = 'Uma nova consulta foi no sistema do SIGED\n\nNome: Nome da Demanda\nDescrição: Descrição da Demanda\n';
const resExpectedEmail = { subject: subjectEmail, text: textEmail };
const subjectAlert = 'Sua consulta está próxima';
const textAlert = 'Faltam 5 dias para sua consulta cadastrada no SIGED\n\nNome: Nome da Demanda\nDescrição: Descrição da Demanda\n';
const resExpectedAlert = { subject: subjectAlert, text: textAlert };

const demand = {
  name: 'Nome da Demanda',
  description: 'Descrição da Demanda'
};

const daysBeforeDemand = '5 dias';

it('Should create demand email',  () => {
  const res = buildDemandCreatedEmail(demand);
  expect(res).toEqual(resExpectedEmail);
});


it('Should create demand alert',  () => {
  const res = buildAlertDemandComing(demand, daysBeforeDemand);
  expect(res).toEqual(resExpectedAlert);
});