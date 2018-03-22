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
var express  = require('express'),
    _     = require('underscore'),
    router = express.Router();
var pipelineLogScript = '/Users/kandaj/get_pipeline_log.sh';


// Database Connection
var db = require('../db/postgres_audit');



router.get('/get_count',getFileCount);

router.get('/get_process_log/:id',getProcessLog);

router.get('/get_pipeline_log/:id',getPipelineLog);

router.get('/get_details/:id',getFileDetails);

router.get('/get_status/:id',getStatusFiles);

router.post('/update_status/',updateStatus);


function getFileCount(req, res, next) {
    db.any('select count(*) as total, archive_status_id from audit_file where ' +
        'archive_status_id=8 or archive_status_id=10 or archive_status_id=14 or archive_status_id=22 or archive_status_id=23 or archive_status_id=25 ' +
        'group by archive_status_id')
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    count: data.length,
                    data: data,
                    message: ''
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function getProcessLog(req, res, next) {
    var stableID = req.params.id;
    db.one('SELECT * FROM audit_archive_process_log where stable_id=$1',stableID)
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

function getPipelineLog(req, res, next) {
    var exec = require('child_process').exec;
    exec(pipelineLogScript+" "+req.params.id, function(err, stdout, stderr) {
        res.status(200).send(JSON.stringify(stdout));
    });
}

function getFileDetails(req, res, next) {
    var stableID = req.params.id;
    db.one("select a.*,m.process_step,m.md5 FROM   audit_sync1.audit_file a\n" +
        "LEFT   JOIN (\n" +
        "    select file_stable_id, string_agg(DISTINCT md5_checksum, ',') as md5, string_agg(DISTINCT process_step, ',') as process_step\n" +
        "    FROM   audit_sync1.audit_md5 \n" +
        "    group by file_stable_id\n" +
        "    ) m ON a.stable_id  = m.file_stable_id\n" +
        "where a.stable_id= $1",stableID)
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

function getStatusFiles(req, res, next) {
    var statusID = req.params.id;
    db.any("select * from audit_file where archive_status_id=$1",statusID)
        .then(function (data) {
            res.status(200)
                .json({
                    status: 'success',
                    data: data,
                    count: data.length,
                    message: ''
                });
        })
        .catch(function (err) {
            return next(err);
        });
}

function updateStatus(req, res, next) {
    var stableIds = req.body[0].stableIDs;
    var statusID = req.body[0].statusID;
    db.tx(t => {
        const queries = stableIds.map(stableId => {
            return t.none('UPDATE audit_file SET archive_status_id=$1 WHERE stable_id = $2', [statusID,stableId]);
        });
        return t.batch(queries);
    })
        .then(data => {
            return res.status(201).json({
                status: 'success',
                data: data.length,
                count: data.length,
                message: ''
            });
        })
        .catch(error => {
        });
}




module.exports = router;