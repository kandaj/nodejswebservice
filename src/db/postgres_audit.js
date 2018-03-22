var promise = require('bluebird');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(process.argv[2]);
var dbProperties = properties.path().postgres_audit;
var pipelineLogScript = '/Users/kandaj/get_pipeline_log.sh';

const config = {
    host: dbProperties.host,
    port: dbProperties.port,
    database: dbProperties.database,
    user: dbProperties.user,
    password:dbProperties.password,
    poolSize:10
};

var options = {
    // Initialization Options
    promiseLib: promise,
    connect: function (client, dc, isFresh) {
        if (isFresh) {
            client.query('SET search_path = '+dbProperties.schema);
        }
    }
};

var pgp = require('pg-promise')(options);

var db = pgp(config);



module.exports = db;

process.on('SIGINT', function () {
    console.log("Ending Postgres connection pool");
    db.$pool.end();
    pgp.end();
});