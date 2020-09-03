/* eslint-disable no-console */

'use strict';

const {
    TransformAction, newTable, TableType
} = require('../asset');
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

(async function run() {
    console.time(`insert ${testData.length} records`);
    for (let i = 0; i < 10; i++) {
        await table.insert(testData);
    }
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

        for (let i = 0; i < 3; i++) {
            console.time(`transform ${action} (${i + 1})`);
            await table.transform(fields[action], action);
            console.timeEnd(`transform ${action} (${i + 1})`);
        }

        if (logUsage) console.log(`END ${action}`, process.resourceUsage());
    }
    if (logUsage) console.log('END', process.resourceUsage());

    console.log('DONE, exiting in 5 seconds...');
    setTimeout(() => {}, 5000);
}());
