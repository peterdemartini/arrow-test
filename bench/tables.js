'use strict';

const { fastCloneDeep } = require('@terascope/job-components');
const testData = require('./fixtures/test-data.json');
const {
    ArrowTable, SimpleTable, JSONTable
} = require('../asset');

const typeConfig = Object.entries({
    _key: {
        type: 'Keyword'
    },
    name: {
        type: 'Keyword'
    },
    age: {
        type: 'Short'
    },
    ssn: {
        type: 'Keyword'
    },
    favorite_animal: {
        type: 'Keyword'
    },
    ip: {
        type: 'IP'
    },
    phone: {
        type: 'Keyword'
    },
    birthday: {
        type: 'Date'
    },
    address: {
        type: 'Text'
    },
    alive: {
        type: 'Boolean'
    },
});
const arrowTable = new ArrowTable(typeConfig);
arrowTable.insert(fastCloneDeep(testData));

const simpleTable = new SimpleTable(typeConfig);
simpleTable.insert(fastCloneDeep(testData));

const jsonTable = new JSONTable(typeConfig);
jsonTable.insert(fastCloneDeep(testData));
module.exports = {
    json: jsonTable,
    simple: simpleTable,
    arrow: arrowTable,
};
