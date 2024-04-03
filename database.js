const { Client } = require('pg');

const url = 'postgres://nbaohiul:g6A8ge1A7or8QhCS7dCVD3FEIDlGhaaw@raja.db.elephantsql.com/nbaohiul';

const client = new Client({
  url: url
});
module.exports = {
  query: (text, params, callback) => {
    console.log('executed query', text);
    return client.query(text, params, callback);
  }
};
