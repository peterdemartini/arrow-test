/* eslint-disable no-console */

'use strict';

const {
    TransformAction, ArrowTable
} = require('../asset/dist/__lib');
const testData = require('../asset/people.json');

process.env.LOG_TIMES = 'true';

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
console.time(`insert ${testData.length} records`);
arrowTable.insert(testData);
console.timeEnd(`insert ${testData.length} records`);

const fields = {
    [TransformAction.toUpperCase]: 'favorite_animal',
    [TransformAction.toLowerCase]: 'favorite_animal',
    [TransformAction.increment]: 'age',
    [TransformAction.decrement]: 'age',
};

console.log('START', process.resourceUsage());
for (const action of Object.values(TransformAction)) {
    console.time(`transform ${action}`);
    console.log(`START ${action}`, process.resourceUsage());
    arrowTable.transform(fields[action], action);
    console.log(`END ${action}`, process.resourceUsage());
    console.timeEnd(`transform ${action}`);
}
console.log('END', process.resourceUsage());
