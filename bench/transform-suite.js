'use strict';

const { fastCloneDeep } = require('@terascope/job-components');
const { Suite } = require('./helpers');
const {
    TransformAction, ArrowTable, SimpleTable, JSONTable
} = require('../asset');
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

const run = async () => Suite('Transform')
    .add('Transform (arrow)', {
        fn() {
            arrowTable.transform('favorite_animal', TransformAction.toUpperCase);
        }
    })
    .add('Transform (simple)', {
        fn() {
            simpleTable.transform('favorite_animal', TransformAction.toUpperCase);
        }
    })
    .add('Transform (json)', {
        fn() {
            jsonTable.transform('favorite_animal', TransformAction.toUpperCase);
        }
    })
    .run({
        async: true,
        minSamples: 3,
        initCount: 0,
        maxTime: 5
    });

if (require.main === module) {
    run().then((suite) => {
        suite.on('complete', () => {});
    });
} else {
    module.exports = run;
}
