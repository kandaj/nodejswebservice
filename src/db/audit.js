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



var mysql = require('mysql');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader(process.argv[2]);
var dsProperties = properties.path().audit_test;
var db = null;
var pool  = mysql.createPool({
    host     : dsProperties.host,
    port     : dsProperties.port,
    user     : dsProperties.user,
    password : dsProperties.password,
    database : dsProperties.database,
    insecureAuth: true,
    connectionLimit : 10
});
process.on('SIGINT', function () {
    console.log("Ending mysql connection pool");
    pool.end();
});

module.exports = pool;