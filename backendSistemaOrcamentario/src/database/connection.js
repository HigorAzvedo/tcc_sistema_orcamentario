const knex = require('knex');
const configuration = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const connection = knex(configuration[environment] || configuration.development);

module.exports = connection;