const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');

const UpdateDB = DATABASE.define('UpdateInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    commitHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'update_info',
    timestamps: false,
    hooks: {
        beforeCreate: (record) => { record.id = 1; },
        beforeBulkCreate: (records) => {
            records.forEach(record => { record.id = 1; });
        },
    },
});

async function initializeUpdateDB() {
    await UpdateDB.sync();
    // Use upsert to handle both creation and updates more efficiently
    const [record, created] = await UpdateDB.upsert({
        id: 1,
        commitHash: 'unknown',
    });
    return record;
}

async function setCommitHash(hash) {
    // You don't need to initialize the DB every time
    // This can be done once when the application starts
    const [record, created] = await UpdateDB.upsert({
        id: 1,
        commitHash: hash,
    });
    return record;
}

async function getCommitHash() {
    const record = await UpdateDB.findByPk(1);
    return record ? record.commitHash : 'unknown';
}

module.exports = {
    UpdateDB,
    setCommitHash,
    getCommitHash,
};
