let mongoose = require('mongoose');

//Contact Schema
let articleSchema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  number:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  }
});

let Contact = module.exports = mongoose.model('Contact', articleSchema);
