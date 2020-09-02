'use strict';

const { fastCloneDeep } = require('@terascope/job-components');
const { Suite } = require('./helpers');
const {
    TransformAction, ArrowTable, SimpleTable, JSONTable
} = require('../asset/dist/__lib');
const testData = require('./fixtures/test-data.json');

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
const tables = { arrow: arrowTable, simple: simpleTable, json: jsonTable };

const fields = {
    [TransformAction.toUpperCase]: 'favorite_animal',
    [TransformAction.toLowerCase]: 'favorite_animal',
    [TransformAction.increment]: 'age',
    [TransformAction.decrement]: 'age',
};

const run = async () => {
    const suite = Suite('Transform');
    for (const action of Object.values(TransformAction)) {
        for (const [tableType, table] of Object.entries(tables)) {
            suite.add(`${action} transform (${tableType})`, {
                fn() {
                    table.transform(fields[action], action);
                }
            });
        }
    }
    return suite.run({
        async: false,
        minSamples: 5,
        initCount: 2,
        maxTime: 10
    });
};

if (require.main === module) {
    run().then((suite) => {
        suite.on('complete', () => {});
    });
} else {
    module.exports = run;
}
