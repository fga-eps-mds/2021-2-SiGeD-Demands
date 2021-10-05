const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  path: {
    type: String,
    require: true,
  },
  size: {
    type: Number,
    require: false,
  },
  demandID: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Demand' }],
    require: true,
  },
  createdAt: {
    type: Date,
    require: true,
  },
  updatedAt: {
    type: Date,
    require: true,
  },
});

module.exports = mongoose.model('File', FileSchema);
