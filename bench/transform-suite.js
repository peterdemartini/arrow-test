'use strict';

const { Suite } = require('./helpers');
const {
    TransformAction
} = require('../asset/dist/__lib');
const tables = require('./tables');

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
                defer: true,
                fn(deferred) {
                    table.transform(
                        fields[action], action
                    ).then(() => deferred.resolve());
                }
            });
        }
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
