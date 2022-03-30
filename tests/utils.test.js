const {buildDemandCreatedEmail, buildAlertDemandComing} = require('../src/Utils/mailer');
const {buildHistory} = require('../src/Utils/verifyChanges');

const subjectEmail = 'Nova consulta';
const textEmail = 'Uma nova consulta foi no sistema do SIGED\n\nNome: Nome da Demanda\nDescrição: Descrição da Demanda\n';
const resExpectedEmail = { subject: subjectEmail, text: textEmail };
const subjectAlert = 'Sua consulta está próxima';
const textAlert = 'Faltam 5 dias para sua consulta cadastrada no SIGED\n\nNome: Nome da Demanda\nDescrição: Descrição da Demanda\n';
const resExpectedAlert = { subject: subjectAlert, text: textAlert };
const expectedBuildHistoryRes = {
  label: 'description',
  before: 'Descrição da Demanda',
  after: 'description',
  userID: '6089c3538dfebe00555bc17e'
};

const demand = {
  name: 'Nome da Demanda',
  description: 'Descrição da Demanda',
  process: '000000',
  categoryID: ['6070b70835599b005b48b32d', '6070b71635599b005b48b32e'],
  sectorID: '606281ba4772b00034eb13fe',
  clientID: '6085e65a664ee00049cc7638',
  userID: '6089c3538dfebe00555bc17e'
};

const bodyTest = {
  description: 'description',
  userID: '6089c3538dfebe00555bc17e'
}


const daysBeforeDemand = '5 dias';

it('Should create demand email',  () => {
  const res = buildDemandCreatedEmail(demand);
  expect(res).toEqual(resExpectedEmail);
});


it('Should create demand alert',  () => {
  const res = buildAlertDemandComing(demand, daysBeforeDemand);
  expect(res).toEqual(resExpectedAlert);
});

it('Should build history', () => {
  const res = buildHistory(bodyTest, demand, 'description');
  delete res.date;
  expect(res).toEqual(expectedBuildHistoryRes);
});