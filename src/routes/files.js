/*
 * European Variation Archive (EVA) - Open-access database of all types of genetic
 * variation data from all species
 *
 * Copyright 2018 EMBL - European Bioinformatics Institute
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var   mysql    = require('mysql'),
      express  = require('express'),
         _     = require('underscore'),
      router = express.Router();
var pipelineLogScript = '/Users/kandaj/get_pipeline_log.sh';

var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(process.argv[2]);

var dsProperties = properties.path().audit_test;

// Database Connection
var pool = require('../db/audit');

router.get('/get_status/:id', function (req, res, next) {
    pool.getConnection(function(err, connection) {
        if(!err){
            connection.query("SELECT f.*, GROUP_CONCAT(m.md5_checksum SEPARATOR ', ') as md5,GROUP_CONCAT(m.process_step SEPARATOR ', ') as process_step from audit_file f, audit_md5 m  where f.archive_status_id=? and f.stable_id=m.file_stable_id GROUP by m.file_stable_id",[req.params.id], function(err, rows, fields) {
                connection.release();
                if (!err){
                    var response = [];
                    if (!_.isEmpty(rows)) {
                        response.push({'result' : 'success', 'count': rows.length,'data' : rows});
                    } else {
                        response.push({'result' : 'error', 'msg' : 'No Results Found'});
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
            });
        } else {
            res.status(400).send(err);
        }
    });

});
router.get('/get_details/:id', function (req, res, next) {
    pool.getConnection(function(err, connection) {
        if(!err){
            connection.query("SELECT f.*, GROUP_CONCAT(m.md5_checksum SEPARATOR ', ') as md5,GROUP_CONCAT(m.process_step SEPARATOR ', ') as process_step from audit_file f, audit_md5 m  where f.stable_id=? and f.stable_id=m.file_stable_id",[req.params.id], function(err, rows, fields) {
                connection.release();
                if (!err){
                    var response = [];
                    if (!_.isEmpty(rows)) {
                        response.push({'result' : 'success', 'count': rows.length,'data' : rows});
                    } else {
                        response.push({'result' : 'error', 'msg' : 'No Results Found'});
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
            });
        } else {
            res.status(400).send(err);
        }
    });

});
router.get('/get_process_log/:id', function (req, res, next) {
    pool.getConnection(function(err, connection) {
        if(!err){
            connection.query("SELECT * FROM audit_archive_process_log where stable_id=?",[req.params.id], function(err, rows, fields) {
                connection.release();
                if (!err){
                    var response = [];
                    if (!_.isEmpty(rows)) {
                        response.push({'result' : 'success', 'count': rows.length,'data' : rows});
                    } else {
                        response.push({'result' : 'error', 'msg' : 'No Results Found'});
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify(response));
                } else {
                    res.status(400).send(err);
                }
            });
        } else {
            res.status(400).send(err);
        }
    });

});

router.get('/get_pipeline_log/:id', function (req, res, next) {
    var exec = require('child_process').exec;
    exec(pipelineLogScript+" "+req.params.id, function(err, stdout, stderr) {
       res.status(200).send(JSON.stringify(stdout));
    });
});

router.get('/get_count', function (req, res, next) {
    pool.getConnection(function(err, connection) {
        if(!err){
            connection.query('select count(*) as total, archive_status_id from audit_file where ' +
                'archive_status_id=8 or archive_status_id=10 or archive_status_id=14 or archive_status_id=22 or archive_status_id=23 or archive_status_id=25 ' +
                'group by archive_status_id\n',[req.params.id], function(err, rows, fields) {
                connection.release();
                if (!err){
                    var response = [];
                    if (!_.isEmpty(rows)) {
                        var results = []
                        for (var i = 0; i < rows.length; i++) {
                            var row = rows[i];
                            results.push(row);
                        }
                        response.push({'result' : 'success', 'count': rows.length,'data' : results});
                    } else {
                        response.push({'result' : 'error', 'msg' : 'No Results Found'});
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).send(JSON.stringify(response));
                } else {
                    console.log(err)
                    res.status(400).send(err);
                }
            });
        } else {
            res.status(400).send(err);
        }
    });

});

router.post('/update_status', function (req, res, next) {
    pool.getConnection(function(err, connection) {
        if(!err){
            var stableIds = req.body[0].stableIDs;
            var stableIDString = stableIds.map(function(stableId) { return "'" + stableId + "'" }).join(',');
            var statusID = req.body[0].statusID;
            connection.query('UPDATE audit_file SET archive_status_id=? WHERE stable_id IN ('+stableIDString+')',[statusID], function(err, response, fields) {
                connection.release();
                if (!err){
                    console.log(response)
                    res.setHeader('Content-Type', 'application/json');
                    res.status(201).send(JSON.stringify(response));
                } else {
                    console.log(err)
                    res.status(400).send(err);
                }
            });
        } else {
            res.status(400).send(err);
        }
    });

});

module.exports = router;