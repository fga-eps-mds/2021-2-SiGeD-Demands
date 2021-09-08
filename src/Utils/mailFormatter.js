const createDemandEmail = (demand) => {
  const subject = "Nova demanda criada";
  var text = "";
  text += "Uma nova demanda foi criada \n";
  text += "\n";
  text += `Nome: ${demand.name}\n`;
  text += `Descrição: ${demand.description}\n`;
  return { subject, text };
};

module.exports = {
  createDemandEmail,
};
