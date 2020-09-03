'use strict';

const { Suite } = require('./helpers');
const tables = require('./tables');

const run = async () => {
    const suite = Suite('Sum');
    for (const [tableType, table] of Object.entries(tables)) {
        suite.add(`sum (${tableType})`, {
            defer: true,
            fn(deferred) {
                table.sum('age').then(() => deferred.resolve());
            }
        });
    }
    return suite.run({
        async: true,
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
