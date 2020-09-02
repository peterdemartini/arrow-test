/* eslint-disable no-console */

'use strict';

const {
    TransformAction, newTable, TableType
} = require('../asset/dist/__lib');
const testData = require('../asset/people.json');

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
const table = newTable(TableType.arrow, typeConfig);

console.time(`insert ${testData.length} records`);
table.insert(testData);
console.timeEnd(`insert ${testData.length} records`);

const fields = {
    [TransformAction.toUpperCase]: 'favorite_animal',
    [TransformAction.toLowerCase]: 'favorite_animal',
    [TransformAction.increment]: 'age',
    [TransformAction.decrement]: 'age',
};

const logUsage = false;

if (logUsage) console.log('START', process.resourceUsage());
for (const action of Object.values(TransformAction)) {
    if (logUsage) console.log(`START ${action}`, process.resourceUsage());

    console.time(`transform ${action}`);
    table.transform(fields[action], action);
    console.timeEnd(`transform ${action}`);

    if (logUsage) console.log(`END ${action}`, process.resourceUsage());
}
if (logUsage) console.log('END', process.resourceUsage());
