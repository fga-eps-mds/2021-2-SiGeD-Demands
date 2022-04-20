const moment = require('moment-timezone');
const { getCategories } = require('../../../2021-2-SiGeD-Frontend/src/Services/Axios/demandsServices');
const Category = require('../Models/CategorySchema');
const validation = require('../Utils/validate');
const { demandGet } = require('/DemandController');

const categoryGet = async (req, res) => {
  const categories = await Category.find();

  console.log(categories);

  return res.json(categories);
};

const categoryGetAtivos = async (req, res) => {
  const categories = await Category.find({ open: true });

  console.log(categories);

  return res.status(200).json(categories);
};

const categoryCreate = async (req, res) => {
  const { name, description, color } = req.body;

  const validFields = validation.validateCategory(name, description, color);

  if (validFields.length) {
    return res.status(400).json({ status: validFields });
  }

  const verifyCategory = await Category.findOne({ name: req.body.name });

  if (verifyCategory) {
    return res.status(409).json({ message: 'The category already exists.' });
  }

  const newCategory = await Category.create({
    name,
    description,
    color,
    createdAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
    updatedAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
  });

  return res.json(newCategory);
};

const categoryUpdate = async (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;

  const validFields = validation.validateCategory(name, description, color);

  if (validFields.length) {
    return res.status(400).json({ status: validFields });
  }

  try {
    const updateStatus = await Category.findOneAndUpdate({ _id: id }, {
      name,
      description,
      color,
      updatedAt: moment.utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss')).toDate(),
    }, { new: true }, (user) => user);
    return res.json(updateStatus);
  } catch {
    return res.status(400).json({ err: 'invalid id' });
  }
};

const toggleCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const token = req.headers['x-access-token'];

    const categoryFound = await Category.findOne({ _id: id })

    const demand = await demandGet(token);

    if (demand.error) {
      return res.status(400).json({ err: demand.error });
    }

    for(var i=0; i<demand.length; i++){
      if(demand[i].categoryID === id && demand[i].open === true){
        startModal();
        return;
      }
    }

    let { open } = categoryFound;

    open = !categoryFound.open;

    const updateStatus = await Category.findOneAndUpdate(
      { _id: id },
      {
        open,
        updatedAt: moment
          .utc(moment.tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ss'))
          .toDate(),
      },
      { new: true },
      (category) => category,
    );

    return res.json(updateStatus)
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

const categoryId = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({ _id: id });
    return res.status(200).json(category);
  } catch {
    return res.status(400).json({ err: 'Invalid ID' });
  }
};

module.exports = {
  categoryGet, categoryCreate, categoryUpdate, toggleCategory, categoryId, categoryGetAtivos,
};
