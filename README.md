# Ensembl Test [![Build Status](https://travis-ci.org/kandaj/ensembl_test.svg?branch=master)](https://travis-ci.org/kandaj/ensembl_test/)

### Prerequisites:

- [Node.js](https://nodejs.org/en/) version ﻿>= 7.0
- [npm](https://www.npmjs.com/) modules

_package.json_ lists the dependency npm modules to be installed.

### Summary of steps to build app

```
git clone https://github.com/kandaj/ensembl_test

cd ensembl_test

npm install

```

### To start sever run the following command:

`npm start`


### To stop the server:

`Terminate Ctrl + C`

### To test the application:

`npm test` *server should be running to test the application


## Application

Once the server is started sucessfully the applcation will be running under port 5000 and
can be accessed by the follwoing URL 
- [http://localhost:5000/](http://localhost:5000/)

### Gene Suggest Web Service
- [http://localhost:5000/gene_suggest](http://localhost:5000/gene_suggest)

List of parameters

- query   -the partial query typed by the user, ex: brc
- species -the name of the target species, ex: homo_sapiens
- limit   -the maximum number of suggestions to return, ex: 10

Ex: [http://localhost:5000/gene_suggest?query=BRCA&species=homo_sapiens&limit=10](http://localhost:5000/gene_suggest?query=BRCA&species=homo_sapiens&limit=10)# nodejswebservice
