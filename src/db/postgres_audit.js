var promise = require('bluebird');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(process.argv[2]);
var dbProperties = properties.path().postgres_audit;

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


function getFileCount(req, res, next) {
    db.any('select count(*) as total, archive_status_id from audit_file where ' +
        'archive_status_id=8 or archive_status_id=10 or archive_status_id=14 or archive_status_id=22 or archive_status_id=23 or archive_status_id=25 ' +
        'group by archive_status_id')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    message: ''
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

module.exports = {
    getFileCount: getFileCount
};