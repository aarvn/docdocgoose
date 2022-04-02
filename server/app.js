const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const officialTemplates = require('./api/officialTemplates');
app.use('/officialTemplates', officialTemplates);
const documents = require('./api/documents');
app.use('/documents', documents);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('../client'));

module.exports = app;
