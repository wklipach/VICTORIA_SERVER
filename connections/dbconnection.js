const mariadb = require('mariadb');

const pool = mariadb.createPool({host: '127.0.0.1', user: 'root', password : '12345', database : 'victoria', connectionLimit: 5});

module.exports=pool;

