const request = require('supertest');
const moment = require('moment-timezone');
const app = require('../src/index');
const jwt = require('jsonwebtoken');
const { categoryId } = require('../src/Controllers/CategoryController');
const mongoose = require('mongoose');

describe('Sample Test', () => {
  // Saving categories ids to use when create demands constants
  let category_id;
  let demand_id;

  // Categories test comes first.

  // Categories values:
  const category = {
    name: 'Nome da Categoria',
    description: 'Descrição da Demanda',
    color: '#000000'
  };

  const category2 = {
    name: 'Nome da Categoria 2',
    description: 'segunda categoria',
    color: '#ff0000'
  };

  // token declaration:
  const token = jwt.sign({
    name: "Teste",
    description: "Teste",
    process: '000000',
    categoryID: ['000000'],
    sectorID: '000000',
    clientID: '000000',
    userID: '000000'
  }, process.env.SECRET, {
    expiresIn: 240,
  });

  beforeAll(async () => {
    // Create demand with client and user from mock
    const demand = {
      name: 'Nome da Demanda',
      description: 'Descrição da Demanda',
      process: '000000',
      categoryID: ['6070b70835599b005b48b32d', '6070b71635599b005b48b32e'],
      sectorID: '606281ba4772b00034eb13fe',
      clientID: '6085e65a664ee00049cc7638',
      userID: '6089c3538dfebe00555bc17e'
    }
    const res = await request(app).post('/demand/create').set('x-access-token', token).send(demand);
    await request(app).post('/demand/create').set('x-access-token', token).send(demand);
    await request(app).post('/demand/create').set('x-access-token', token).send(demand);
    await request(app).post('/demand/create').set('x-access-token', token).send(demand);
    await request(app).post('/demand/create').set('x-access-token', token).send(demand);
    demand_id = res.body._id;
  })


  // Test API:
  it('App is defined', (done) => {
    expect(app).toBeDefined();
    done();
  });

  it('Get newest four demands', async (done) => {
    const res = await request(app).get('/demand/newest-four').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(4);
    done();
  });

  it('Post category', async (done) => {
    const res = await request(app).post('/category/create').set('x-access-token', token).send(category);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(category.name);
    expect(res.body.description).toBe(category.description);
    expect(res.body.color).toBe(category.color);
    category_id = res.body._id;
    done();
  });

  it('Post category 2', async (done) => {
    const res = await request(app).post('/category/create').set('x-access-token', token).send(category2);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(category2.name);
    expect(res.body.description).toBe(category2.description);
    expect(res.body.color).toBe(category2.color);
    category_id2 = res.body._id;
    done();
  });

  it('Post category error', async (done) => {
    const errorCategory = {
      name: '',
      description: '',
      color: ''
    };
    const res = await request(app).post('/category/create').set('x-access-token', token).send(errorCategory);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid name', 'invalid description', 'invalid color']);
    done();
  });

  it('Get category', async (done) => {
    const res = await request(app).get('/category/').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    done();
  });

  it('Get id category', async (done) => {
    const res = await request(app).get(`/category/${category_id}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(category.name);
    expect(res.body.description).toBe(category.description);
    expect(res.body.color).toBe(category.color);
    done();
  });

  it('Get id category error', async (done) => {
    const res = await request(app).get('/category/12345678912345678912345').set('x-access-token', token);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe("Invalid ID");
    done();
  });

  it('Update category', async () => {
    const category = {
      name: "porte de arma",
      description: "avaliação psicológica",
      color: "#000000"
    };
    const res = await request(app)
      .put(`/category/update/${category_id}`)
      .set('x-access-token', token)
      .send(category);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(category.name);
    expect(res.body.description).toBe(category.description);
    expect(res.body.color).toBe(category.color);
  });

  it('Update category error', async () => {
    const category = {
      name: "",
      description: "Jest description",
      color: "#000000"
    }
    const res = await request(app)
      .put(`/category/update/${category_id}`)
      .set('x-access-token', token)
      .send(category);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid name']);
  });

  it('Update with invalid id', async () => {
    const category = {
      name: "porte de arma",
      description: "avaliação psicológica",
      color: "#000000"
    };
    const res = await request(app)
      .put(`/category/update/123abc`)
      .set('x-access-token', token)
      .send(category)
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe('invalid id')
  });

  it('Update category without token', async () => {
    const category = {
      name: "Jest test",
      description: "Jest description",
      color: "#000000"
    }
    const res = await request(app)
      .put(`/category/update/${category_id}`)
      .send(category);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, errorCode: 401, message: 'No token was provided' });
  });

  it('Update category with invalid token', async () => {
    const tokenFalho = 'abc123';
    const category = {
      name: "Jest test",
      description: "Jest description",
      color: "#000000"
    }
    const res = await request(app)
      .put(`/category/update/${category_id}`)
      .set('x-access-token', tokenFalho)
      .send(category);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, message: 'It was not possible to authenticate the token.' });
  });

  // Demands tests

  // Demands constants
  let id;
  let falseId;
  const sectorName = null;
  const categoryName = null;
  const demand = {
    name: 'Nome da Demanda',
    description: 'Descrição da Demanda',
    process: '000000',
    categoryID: ['6070b70835599b005b48b32d', '6070b71635599b005b48b32e'],
    sectorID: '6064ffa9942d5e008c0734dc',
    clientID: '6054dacb934bd000d7ca623b',
    userID: '6089c3538dfebe00555bc17e'
  };
  const falseDemand = {
    name: 'Nome da Demanda',
    description: 'Descrição da Demanda',
    process: '000000',
    categoryID: ['6070b70835599b005b48b32d', '6070b71635599b005b48b32e'],
    sectorID: '6064ffa9942d5e008c0734dc',
    clientID: '6054dacb934bd000d7ca623b',
    userID: '6089c3538dfebe00555bc17e',
  };
  const updatedSectorID = {
    sectorID: 'TESTE'
  };
  const forwardSectorID = {
    sectorID: 'TESTE 2'
  };

  it('Post demand', async (done) => {
    const res = await request(app).post('/demand/create').set('x-access-token', token).send(demand);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(demand.name);
    expect(res.body.description).toBe(demand.description);
    expect(res.body.process.toString()).toBe(demand.process);
    expect(res.body.sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body.clientID).toBe(demand.clientID);
    expect(res.body.userID).toBe(demand.userID);
    id = res.body._id;
    done();
  });

  it('Post closed demand', async (done) => {
    const res = await request(app).post('/demand/create').set('x-access-token', token).send(falseDemand);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(falseDemand.name);
    expect(res.body.description).toBe(falseDemand.description);
    expect(res.body.process.toString()).toBe(falseDemand.process);
    expect(res.body.sectorHistory[0].sectorID).toBe(falseDemand.sectorID);
    expect(res.body.clientID).toBe(falseDemand.clientID);
    expect(res.body.userID).toBe(falseDemand.userID);
    falseId = res.body._id;
    done();
  });

  it('Post demand error', async (done) => {
    const errorDemand = {
      name: '',
      description: '',
      categoryID: '',
      sectorID: '',
      clientID: '',
      userID: ''
    };
    const res = await request(app).post('/demand/create').set('x-access-token', token).send(errorDemand);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual([
      'invalid name',
      'invalid description',
      'invalid category id',
      'invalid sector id',
      'invalid client id',
      'invalid user id'
    ]);
    done();
  });

  it('Get demand', async (done) => {
    const res = await request(app).get('/demand/').set('x-access-token', token);
    const lastIdx = res.body.length - 1;
    expect(res.body[lastIdx].name).toBe(demand.name);
    expect(res.body[lastIdx].clientID).toBe(demand.clientID);
    expect(res.body[lastIdx].process.toString()).toBe(demand.process);
    expect(res.body[lastIdx].sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body[lastIdx].userID).toBe(demand.userID);
    expect(res.body[lastIdx].description).toBe(demand.description);
    expect(res.statusCode).toBe(200);
    done();
  });

  it('Get demand', async (done) => {
    const res = await request(app).get('/demand/?open=true').set('x-access-token', token);
    const lastIdx = res.body.length - 1;
    expect(res.body[lastIdx].name).toBe(demand.name);
    expect(res.body[lastIdx].process.toString()).toBe(demand.process);
    expect(res.body[lastIdx].clientID).toBe(demand.clientID);
    expect(res.body[lastIdx].sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body[lastIdx].description).toBe(demand.description);
    expect(res.body[lastIdx].userID).toBe(demand.userID);
    expect(res.statusCode).toBe(200);
    done();
  });

  it('Get id demand', async (done) => {
    const res = await request(app).get(`/demand/${id}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(demand.name);
    expect(res.body.description).toBe(demand.description);
    expect(res.body.process.toString()).toBe(demand.process);
    expect(res.body.sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body.clientID).toBe(demand.clientID);
    expect(res.body.userID).toBe(demand.userID);
    done();
  });
  it('Get id demand error', async (done) => {
    const res = await request(app).get('/demand/12345678912345').set('x-access-token', token);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe("Invalid ID");
    done();
  });

  // Need to close demand before trying to get closed demands, same goes for getting opened demands
  it('Close/Open demand', async (done) => {
    const res = await request(app).put(`/demand/toggle/${id}`).set('x-access-token', token)
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(demand.name);
    expect(res.body.clientID).toBe(demand.clientID);
    expect(res.body.process.toString()).toBe(demand.process);
    expect(res.body.sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body.userID).toBe(demand.userID);
    expect(res.body.description).toBe(demand.description);
    done();
  });

  // Back to getting demands
  it('Get closed demand', async (done) => {
    const res = await request(app).get('/demand?open=false').set('x-access-token', token);
    const lastIdx = res.body.length - 1;
    expect(res.statusCode).toBe(200);
    expect(res.body[lastIdx].name).toBe(demand.name);
    expect(res.body[lastIdx].clientID).toBe(demand.clientID);
    expect(res.body[lastIdx].process.toString()).toBe(demand.process);
    expect(res.body[lastIdx].sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body[lastIdx].userID).toBe(demand.userID);
    expect(res.body[lastIdx].description).toBe(demand.description);
    expect(res.body[lastIdx].open).toBe(false);
    done();
  });
  
  // Reopen demand
  it('Close/Open demand', async (done) => {
    const res = await request(app).put(`/demand/toggle/${id}`).set('x-access-token', token)
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(demand.name);
    expect(res.body.clientID).toBe(demand.clientID);
    expect(res.body.process.toString()).toBe(demand.process);
    expect(res.body.sectorHistory[0].sectorID).toBe(demand.sectorID);
    expect(res.body.userID).toBe(demand.userID);
    expect(res.body.description).toBe(demand.description);
    done();
  });

  it('toggle demand error', async (done) => {
    const res = await request(app).put('/demand/toggle/123456789').set('x-access-token', token);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe("Invalid ID");
    done();
  });

  /*it('Update demand', async () => {
    const demandUpdate = {
      name: 'Retirada de Documento',
      description: 'Retirar documento na DPSS',
      process: '4005',
      categoryID: ['6064ffa9942d5e008c07e61a'],
      sectorID: 'sectorID',
      clientID: 'clientID',
      userID: '6089c3538dfebe00555bc17e'
    };
    const res = await request(app).put(`/demand/update/${id}`).set('x-access-token', token).send(demandUpdate);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(demandUpdate.name);
    expect(res.body.process).toBe(demandUpdate.process);
    expect(res.body.description).toBe(demandUpdate.description);
    expect(res.body.userID).toBe(demandUpdate.userID);
    expect(res.body.clientID).toBe(demandUpdate.clientID);
  });*/

  // statisticas tests
  it('Get category statistics', async (done) => {
    const res = await request(app).get(`/statistic/category?idCategory=null&idSector=null&initialDate=${'01-01-2021'}&finalDate=${moment().format('YYYY-MM-DD')}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    done();
  })

  it('Get sector statistics', async (done) => {
    const res = await request(app).get(`/statistic/sector?idCategory=null&idSector=null&initialDate=${'01-01-2021'}&finalDate=${moment().format('YYYY-MM-DD')}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    done();
  })

  it('Get category statistics filtered by category', async (done) => {
    const statisticCategory = {
      name: 'Categoria de estatistica',
      description: 'Categoria sobre as estatistica',
      color: '#000000',
    }
    const resCategory = await request(app).post('/category/create').set('x-access-token', token).send(statisticCategory);
    const idSts = resCategory.body._id;
    const statisticDemand = {
      name: 'Statistic Demand',
      description: 'Descrição da Demanda de estatistica',
      process: '000000',
      categoryID: [idSts],
      sectorID: '606d094f9186b600486c5048',
      clientID: '6054dacb934bd000d7ca623b',
      userID: '6089c3538dfebe00555bc17e'
    }
    const resDemand = await request(app).post('/demand/create').set('x-access-token', token).send(statisticDemand);
    const res = await request(app).get(`/statistic/category?idCategory=${idSts}&idSector=null&initialDate=${'01-01-2021'}&finalDate=${moment().format('YYYY-MM-DD')}`)
    .set('x-access-token', token);
    const lastIdx = res.body.length - 1;
    expect(res.statusCode).toBe(200);
    expect(res.body[lastIdx].demandas).toBe(1);
    done();
  })

  it('Get category statistics filtered by category and sector', async (done) => {
    const statisticCategory = {
      name: 'Categoria de estatistica',
      description: 'Categoria sobre as estatistica',
      color: '#000000',
    }
    const resCategory = await request(app).post('/category/create').set('x-access-token', token).send(statisticCategory);
    const idSts = resCategory.body._id;
    const statisticDemand = {
      name: 'Statistic Demand',
      description: 'Descrição da Demanda de estatistica',
      process: '000000',
      categoryID: [idSts],
      sectorID: '106d094f9186b600486c5048',
      clientID: '6054dacb934bd000d7ca623b',
      userID: '6089c3538dfebe00555bc17e'
    }
    const resDemand = await request(app).post('/demand/create').set('x-access-token', token).send(statisticDemand);
    const res = await request(app).get(`/statistic/category?idCategory=${idSts}&idSector=106d094f9186b600486c5048&initialDate=${'01-01-2021'}&finalDate=${moment().format('YYYY-MM-DD')}`)
    .set('x-access-token', token);
    const lastIdx = res.body.length - 1;
    expect(res.statusCode).toBe(200);
    expect(res.body[lastIdx].demandas).toBe(1);
    done();
  })

  it('Get sector statistics filtered by category', async (done) => {
    const statisticCategory = {
      name: 'Categoria de estatistica',
      description: 'Categoria sobre as estatistica',
      color: '#000000',
    }
    const resCategory = await request(app).post('/category/create').set('x-access-token', token).send(statisticCategory);
    const idSts = resCategory.body._id;
    const statisticDemand = {
      name: 'Statistic Demand',
      description: 'Descrição da Demanda de estatistica',
      process: '000000',
      categoryID: [idSts],
      sectorID: '606d09569186b600486c5049',
      clientID: '6054dacb934bd000d7ca623b',
      userID: '6089c3538dfebe00555bc17e'
    }
    const resDemand = await request(app).post('/demand/create').set('x-access-token', token).send(statisticDemand);
    const res = await request(app).get(`/statistic/sector?=idSector=null&idCategory${idSts}&initialDate=${'01-01-2021'}&finalDate=${moment().format('YYYY-MM-DD')}`)
    .set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    done();
  })

  // Testing each error message
  it('Update demand error name', async () => {
    const demand1 = {
      name: '',
      process: '4005',
      description: 'Retirar documento na DPSS',
      userID: '6089c3538dfebe00555bc17e',
      categoryID: 'categoryID',
      clientID: 'clientID',
      sectorID: 'sectorID'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', token)
      .send(demand1);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid name']);
  });

  it('Update demand error description', async () => {
    const demand2 = {
      name: 'Retirada de documento',
      categoryID: 'categoryID',
      description: '',
      sectorID: 'sectorID',
      userID: '6089c3538dfebe00555bc17e',
      clientID: 'clientID',
      process: '4005'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', token)
      .send(demand2);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid description']);
  });

  it('Update demand error category', async () => {
    const demand4 = {
      categoryID: '',
      description: 'Retirar documento na DPSS',
      sectorID: 'sectorID',
      userID: '6089c3538dfebe00555bc17e',
      process: '4005',
      clientID: 'clientID',
      name: 'Retirada de documento'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', token)
      .send(demand4);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid category id']);
  });

  it('Update demand error sector', async () => {
    const demand5 = {
      sectorID: '',
      name: 'Retirada de documento',
      clientID: 'clientID',
      categoryID: 'categoryID',
      description: 'Retirar documento na DPSS',
      process: '4005',
      userID: '6089c3538dfebe00555bc17e'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', token)
      .send(demand5);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid sector id']);
  });

  it('Update demand error client', async () => {
    const demand6 = {
      categoryID: 'categoryID',
      name: 'Retirada de documento',
      sectorID: 'sectorID',
      process: '4005',
      description: 'Retirar documento na DPSS',
      clientID: '',
      userID: '6089c3538dfebe00555bc17e',
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', token)
      .send(demand6);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid client id']);
  });

  it('Update demand error user', async () => {
    const demand7 = {
      userID: '',
      name: 'Retirada de documento',
      categoryID: 'categoryID',
      description: 'Retirar documento na DPSS',
      clientID: 'clientID',
      sectorID: 'sectorID',
      process: '4005'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', token)
      .send(demand7);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid user id']);
  });

  it('Update with invalid id', async () => {
    const demand8 = {
      name: 'Retirada de arma',
      categoryID: 'IDcategory',
      sectorID: 'IDsector',
      userID: '6089c3538dfebe00555bc17e',
      description: 'Retirar token',
      clientID: 'IDclient',
      process: '504'
    };

    const res = await request(app)
      .put(`/demand/update/123abc`)
      .set('x-access-token', token)
      .send(demand8)
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe('invalid id')
  });

  it('Update demand without token', async () => {
    const demand = {
      userID: '6089c3538dfebe00555bc17e',
      sectorID: 'IDsector',
      categoryID: 'IDcategory',
      description: 'Retirar token',
      process: '504',
      clientID: 'IDclient',
      name: 'Retirada de token'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .send(demand);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, errorCode: 401, message: 'No token was provided' });
  });

  it('Update demand with invalid token', async () => {
    const tokenFalho = 'abc123';
    const demand = {
      userID: '6089c3538dfebe00555bc17e',
      sectorID: 'jkncjh8e7c8nc4819c',
      categoryID: 'cewdu8eu8eceh882em21',
      description: 'Teste',
      process: '907',
      clientID: 'bdheduhdhu29ue8de',
      name: 'Retirada de teste'
    }

    const res = await request(app)
      .put(`/demand/update/${id}`)
      .set('x-access-token', tokenFalho)
      .send(demand);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, message: 'It was not possible to authenticate the token.' });
  });

  /*it('Update Demand Sector', async (done) => {
    const res = await request(app).put(`/demand/sectorupdate/${id}`).set('x-access-token', token).send(updatedSectorID);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Retirada de Documento');
    expect(res.body.clientID).toBe('clientID');
    expect(res.body.process).toBe('4005');
    expect(res.body.sectorHistory[0].sectorID).toBe(updatedSectorID.sectorID);
    expect(res.body.userID).toBe('6089c3538dfebe00555bc17e');
    expect(res.body.description).toBe('Retirar documento na DPSS');
    done();
  });*/
  it('Update Demand Sector error', async (done) => {
    const updatedSectorID = {
      sectorID: ''
    };
    const res = await request(app).put(`/demand/sectorupdate/${id}`).set('x-access-token', token).send(updatedSectorID);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid sectorID']);
    done();
  });
  it('Update Demand Sector ID error', async (done) => {
    const res = await request(app).put(`/demand/sectorupdate/123`).set('x-access-token', token).send(updatedSectorID);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toEqual('Invalid ID');
    done();
  });
  /*it('Forward Demand', async (done) => {
    const res = await request(app).put(`/demand/forward/${id}`).set('x-access-token', token).send(forwardSectorID);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Retirada de Documento');
    expect(res.body.clientID).toBe('clientID');
    expect(res.body.process).toBe('4005');
    expect(res.body.sectorHistory[0].sectorID).toBe(updatedSectorID.sectorID);
    expect(res.body.sectorHistory[1].sectorID).toBe(forwardSectorID.sectorID);
    expect(res.body.userID).toBe('6089c3538dfebe00555bc17e');
    expect(res.body.description).toBe('Retirar documento na DPSS');
    done();
  });*/
  it('Forward Demand error', async (done) => {
    const forwardSectorID = {
      sectorID: ''
    };
    const res = await request(app).put(`/demand/forward/${id}`).set('x-access-token', token).send(forwardSectorID);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid sectorID']);
    done();
  });
  it('Forward Demand ID error', async (done) => {
    const forwardSectorWrong = {
      sectorID: '2343'
    };
    const res = await request(app).put(`/demand/forward/123`).set('x-access-token', token).send(forwardSectorWrong);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toEqual('Invalid ID');
    done();
  });
  /*it('Create Demand Update', async (done) => {
    const demandUpdate = {
      userName: "Nome do usuário",
      userSector: demand.userID,
      userID: demand.userID,
      description: "Descrição da Atualização de Demanda",
      visibilityRestriction: true,
      important: false,
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(demandUpdate);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Retirada de Documento');
    expect(res.body.clientID).toBe('clientID');
    expect(res.body.process).toBe('4005');
    expect(res.body.sectorHistory[0].sectorID).toBe(updatedSectorID.sectorID);
    expect(res.body.sectorHistory[1].sectorID).toBe(forwardSectorID.sectorID);
    expect(res.body.userID).toBe('6089c3538dfebe00555bc17e');
    expect(res.body.description).toBe('Retirar documento na DPSS');
    expect(res.body.updateList[0].userName).toBe(demandUpdate.userName);
    expect(res.body.updateList[0].userSector).toBe(demandUpdate.userSector);
    expect(res.body.updateList[0].userID).toBe(demandUpdate.userID);
    expect(res.body.updateList[0].description).toBe(demandUpdate.description);
    expect(res.body.updateList[0].visibilityRestriction).toBe(demandUpdate.visibilityRestriction);
    expect(res.body.updateList[0].important).toBe(demandUpdate.important);
    const updateid = res.body.updateList[0]._id;
    done();
  });*/
  it('Create Demand Update userName error', async (done) => {
    const userNameError = {
      userName: "",
      userSector: demand.userID,
      userID: demand.userID,
      description: "Descrição da Atualização de Demanda",
      visibilityRestriction: true,
      important: false,
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(userNameError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid userName']);
    done();
  });
  it('Create Demand Update description error', async (done) => {
    const descriptionError = {
      userName: "Nome do Usuário",
      userSector: demand.userID,
      userID: demand.userID,
      description: "",
      visibilityRestriction: true,
      important: false,
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(descriptionError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid description']);
    done();
  });
  it('Create Demand Update visibilityRestriction error', async (done) => {
    const visibilityRestrictionError = {
      userName: "Nome do Usuário",
      userSector: demand.userID,
      userID: demand.userID,
      description: "Descrição da Atualização de Demanda",
      visibilityRestriction: "",
      important: false,
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(visibilityRestrictionError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid visibilityRestriction']);
    done();
  });
  it('Create Demand Update sectorID error', async (done) => {
    const sectorIDError = {
      userName: "Nome do Usuário",
      description: "Descrição da Atualização de Demanda",
      userID: demand.userID,
      visibilityRestriction: true,
      userSector: "",
      important: false,
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(sectorIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid sector']);
    done();
  });
  it('Create Demand Update ID error', async (done) => {
    const demandUpdateIDError = {
      userName: "Usuário X",
      userID: demand.userID,
      description: "Descrição Teste",
      visibilityRestriction: true,
      important: false,
      userSector: demand.userID,
    };
    const res = await request(app).put(`/demand/create-demand-update/123`).set('x-access-token', token).send(demandUpdateIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toEqual('Invalid ID');
    done();
  });
  it('Create Demand Update userID error', async (done) => {
    const sectorIDError = {
      userName: "Nome do Usuário",
      description: "Descrição da Atualização de Demanda",
      userID: "",
      visibilityRestriction: true,
      userSector: demand.userID,
      important: false,
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(sectorIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid user']);
    done();
  });
  it('Create Demand Update important error', async (done) => {
    const sectorIDError = {
      userName: "Nome do Usuário",
      description: "Descrição da Atualização de Demanda",
      userID: demand.userID,
      visibilityRestriction: true,
      userSector: demand.userID,
      important: "",
    };
    const res = await request(app).put(`/demand/create-demand-update/${id}`).set('x-access-token', token).send(sectorIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid important']);
    done();
  });
  it('Update Demand Update userName error', async (done) => {
    const userNameError = {
      userName: "",
      userSector: demand.userID,
      userID: demand.userID,
      description: "Descrição da Atualização de Demanda",
      visibilityRestriction: true,
      important: false,
    };
    const res = await request(app).put(`/demand/update-demand-update/${id}`).set('x-access-token', token).send(userNameError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid userName']);
    done();
  });
  it('Update Demand Update description error', async (done) => {
    const descriptionError = {
      userName: "Nome do Usuário",
      userSector: demand.userID,
      userID: demand.userID,
      description: "",
      visibilityRestriction: true,
      important: false,
    };
    const res = await request(app).put(`/demand/update-demand-update/${id}`).set('x-access-token', token).send(descriptionError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid description']);
    done();
  });
  it('Update Demand Update visibilityRestriction error', async (done) => {
    const visibilityRestrictionError = {
      userName: "Nome do Usuário",
      userSector: demand.userID,
      userID: demand.userID,
      description: "Descrição da Atualização de Demanda",
      visibilityRestriction: "",
      important: false,
    };
    const res = await request(app).put(`/demand/update-demand-update/${id}`).set('x-access-token', token).send(visibilityRestrictionError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid visibilityRestriction']);
    done();
  });
  it('Update Demand Update sectorID error', async (done) => {
    const sectorIDError = {
      userName: "Nome do Usuário",
      description: "Descrição da Atualização de Demanda",
      userID: demand.userID,
      visibilityRestriction: true,
      userSector: "",
      important: false,
    };
    const res = await request(app).put(`/demand/update-demand-update/${id}`).set('x-access-token', token).send(sectorIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid sector']);
    done();
  });
  it('Update Demand Update ID error', async (done) => {
    const demandUpdateIDError = {
      userName: "Usuário X",
      userID: demand.userID,
      description: "Descrição Teste",
      visibilityRestriction: true,
      important: false,
      userSector: demand.userID,
    };
    const res = await request(app).put(`/demand/update-demand-update/123`).set('x-access-token', token).send(demandUpdateIDError);
    expect(res.statusCode).toBe(200);
    done();
  });
  it('Update Demand Update userID error', async (done) => {
    const sectorIDError = {
      userName: "Nome do usuário",
      description: "Descrição da Atualização de Demanda",
      userID: "",
      visibilityRestriction: true,
      userSector: demand.userID,
      important: false,
    };
    const res = await request(app).put(`/demand/update-demand-update/${id}`).set('x-access-token', token).send(sectorIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid user']);
    done();
  });
  it('Update Demand Update important error', async (done) => {
    const sectorIDError = {
      userName: "Nome do Usuário",
      description: "Descrição da Atualização de Demanda",
      userID: demand.userID,
      visibilityRestriction: true,
      userSector: demand.userID,
      important: "",
    };
    const res = await request(app).put(`/demand/update-demand-update/${id}`).set('x-access-token', token).send(sectorIDError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid important']);
    done();
  }); 
  /*it('Delete Demand Update', async (done) => {
    const demandUpdate = {
      userName: "Nome do usuário",
      userSector: demand.userID,
      userID: demand.userID,
      description: "Descrição da Atualização de Demanda",
      visibilityRestriction: true,
      important: false,
    };
    const res = await request(app).put(`/demand/delete-demand-update/${id}`).set('x-access-token', token)
    expect(res.statusCode).toBe(200);
    expect(res.body.userName).toBe(undefined);
    expect(res.body.userSector).toBe(undefined);
    expect(res.body.userID).toBe(demandUpdate.userID);
    expect(res.body.description).toBe('Retirar documento na DPSS');
    expect(res.body.visibilityRestriction).toBe(undefined);
    expect(res.body.important).toBe(undefined);
    done();
  });*/
  it('Delete Demand Update Error', async (done) => {
    const res = await request(app).put(`/demand/delete-demand-update/1234561230`).set('x-access-token', token)
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ "err": "failure" });
    done();
  });
  // Delete category tests comes for last, that's important
  it('Delete category', async (done) => {
    const res = await request(app).delete(`/category/delete/${category_id}`).set('x-access-token', token)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ "message": "success" });
    done();
  });
  it('Delete category error', async (done) => {
    const res = await request(app).delete('/category/delete/09876543210987654321').set('x-access-token', token)
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ "message": "failure" });
    done();
  });

  it('Return demands with clients names', async (done) => {
    const res = await request(app).get('/clientsNames').set('x-access-token', token)
    const lastIdx = res.body.length - 1; // Get last demand on list
    expect(res.body[lastIdx].clientName).toEqual("Julia Batista");
    done();
  });

  it('Get demand history', async (done) => {
    const res = await request(app).get(`/demand/history/${demand_id}`).set('x-access-token', token)
    expect(res.body[0].label).toEqual("created");
    expect(res.body[0].user.name).toEqual("Maria Joaquina");
    done();
  });

  it('Get demand history error', async (done) => {
    const res = await request(app).get(`/demand/history/123`).set('x-access-token', token);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ "message": "Demand not found" });
    done();
  });

  const alert = {
    name: 'Alerta',
    description: 'Descrição',
    date: `${(moment.utc(moment.tz('America/Sao_Paulo').add(5, 'days').format('YYYY-MM-DD')).toDate())}`,
    alertClient: true,
    demandID: '000000000abcdefgh',
    sectorID: 'abcdefgh000000000'
  };

  let alert_demand_id;
  let alert_sector_id;

  it('Post alert', async (done) => {
    const res = await request(app).post('/alert/create').set('x-access-token', token).send(alert);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(alert.name);
    expect(res.body.description).toBe(alert.description);
    expect(res.body.date).toBe(alert.date);
    expect(res.body.alertClient).toBe(alert.alertClient);
    expect(res.body.demandID).toBe(alert.demandID);
    expect(res.body.sectorID).toBe(alert.sectorID);
    alert_demand_id = res.body.demandID;
    alert_sector_id = res.body.sectorID;
    alert_id = res.body._id;
    done();
  });

  const alertError = {
  };

  it('Post alert validation error', async (done) => {
    const res = await request(app).post('/alert/create').set('x-access-token', token).send(alertError);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid name', 'invalid description', 'invalid date', 'invalid demandID', 'invalid sectorID']);
    done();
  });

  it('Get alerts', async (done) => {
    const res = await request(app).get('/alert').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body[res.body.length - 1].name).toBe(alert.name);
    expect(res.body[res.body.length - 1].date).toBe(alert.date);
    expect(res.body[res.body.length - 1].alertClient).toBe(alert.alertClient);
    expect(res.body[res.body.length - 1].description).toBe(alert.description);
    expect(res.body[res.body.length - 1].sectorID).toBe(alert.sectorID);
    expect(res.body[res.body.length - 1].demandID).toBe(alert.demandID);
    done();
  });

  it('Get alerts by demand', async (done) => {
    const res = await request(app).get(`/alert/demand/${alert_demand_id}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body[res.body.length - 1].date).toBe(alert.date);
    expect(res.body[res.body.length - 1].name).toBe(alert.name);
    expect(res.body[res.body.length - 1].description).toBe(alert.description);
    expect(res.body[res.body.length - 1].demandID).toBe(alert.demandID);
    expect(res.body[res.body.length - 1].alertClient).toBe(alert.alertClient);
    expect(res.body[res.body.length - 1].sectorID).toBe(alert.sectorID);
    done();
  });

  it('Get alerts by sector', async (done) => {
    const res = await request(app).get(`/alert/sector/${alert_sector_id}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body[res.body.length - 1].name).toBe(alert.name);
    expect(res.body[res.body.length - 1].demandID).toBe(alert.demandID);
    expect(res.body[res.body.length - 1].date).toBe(alert.date);
    expect(res.body[res.body.length - 1].description).toBe(alert.description);
    expect(res.body[res.body.length - 1].alertClient).toBe(alert.alertClient);
    expect(res.body[res.body.length - 1].sectorID).toBe(alert.sectorID);
    done();
  });

  it('Update alert', async () => {
    const alert = {
      name: "alerta numero 1",
      description: "lembrar joao",
      date: `${(moment.utc(moment.tz('America/Sao_Paulo').add(3, 'days').format('YYYY-MM-DD')).toDate())}`,
      alertClient: true,
      demandID: '000000000abcdefgh',
      sectorID: 'abcdefgh000000000'
    };
    const res = await request(app)
      .put(`/alert/update/${alert_id}`)
      .set('x-access-token', token)
      .send(alert);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(alert.name);
    expect(res.body.description).toBe(alert.description);
    expect(res.body.date).toBe(alert.date);
    expect(res.body.alertClient).toBe(alert.alertClient);
    expect(res.body.demandID).toBe(alert.demandID);
    expect(res.body.sectorID).toBe(alert.sectorID);
  });

  it('Update alert error', async () => {
    const alert = {
      name: "",
      description: "Jest description",
      date: `${(moment.utc(moment.tz('America/Sao_Paulo').add(5, 'days').format('YYYY-MM-DD')).toDate())}`,
      alertClient: true,
      demandID: '000000000abcdefgh',
      sectorID: 'abcdefgh000000000'
    }
    const res = await request(app)
      .put(`/alert/update/${alert_id}`)
      .set('x-access-token', token)
      .send(alert);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid name']);
  });

  it('Update alert with invalid id', async () => {
    const alert = {
      name: "porte de arma",
      description: "avaliação psicológica",
      date: `${(moment.utc(moment.tz('America/Sao_Paulo').add(5, 'days').format('YYYY-MM-DD')).toDate())}`,
      alertClient: true,
      demandID: '000000000abcdefgh',
      sectorID: 'abcdefgh000000000'
    };
    const res = await request(app)
      .put(`/alert/update/123abc`)
      .set('x-access-token', token)
      .send(alert)
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe('invalid id')
  });

  it('Update alert without token', async () => {
    const alert = {
      name: "Jest test",
      description: "Jest description",
      date: `${(moment.utc(moment.tz('America/Sao_Paulo').add(5, 'days').format('YYYY-MM-DD')).toDate())}`,
      alertClient: true,
      demandID: '000000000abcdefgh',
      sectorID: 'abcdefgh000000000'
    }
    const res = await request(app)
      .put(`/alert/update/${alert_id}`)
      .send(alert);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, errorCode: 401, message: 'No token was provided' });
  });

  it('Update alert with invalid token', async () => {
    const tokenFalho = 'abc123';
    const alert = {
      name: "Jest test",
      description: "Jest description",
      date: `${(moment.utc(moment.tz('America/Sao_Paulo').add(5, 'days').format('YYYY-MM-DD')).toDate())}`,
      alertClient: true,
      demandID: '000000000abcdefgh',
      sectorID: 'abcdefgh000000000'
    }
    const res = await request(app)
      .put(`/alert/update/${alert_id}`)
      .set('x-access-token', tokenFalho)
      .send(alert);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, message: 'It was not possible to authenticate the token.' });
  });

  it('Delete alert', async (done) => {
    const res = await request(app).delete(`/alert/delete/${alert_id}`).set('x-access-token', token)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ "message": "success" });
    done();
  });
  it('Delete alert error', async (done) => {
    const res = await request(app).delete('/alert/delete/09876543210987654321').set('x-access-token', token)
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ "message": "failure" });
    done();
  });

})

afterAll(async (done) => {
  await request(app).delete('/demand/create').set('x-access-token', token).send(demand);
  await request(app).delete('/demand/create').set('x-access-token', token).send(demand);
  await request(app).delete('/demand/create').set('x-access-token', token).send(demand);
  await request(app).delete('/demand/create').set('x-access-token', token).send(demand);
  done();
});
