const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../settings');

const AntiDelDB = DATABASE.define('AntiDelete', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: config.ANTI_DELETE || false,
    },
    // Ajout de nouvelles colonnes pour une meilleure gestion
    groupDeletion: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    privateDeletion: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    logChannel: {
        type: DataTypes.STRING,
        defaultValue: '',
    }
}, {
    tableName: 'antidelete',
    timestamps: true, // Activation des timestamps pour le suivi
    hooks: {
        beforeCreate: record => { 
            record.id = 1; 
            record.createdAt = new Date();
            record.updatedAt = new Date();
        },
        beforeBulkCreate: records => { 
            records.forEach(record => { 
                record.id = 1;
                record.createdAt = new Date();
                record.updatedAt = new Date();
            }); 
        },
        beforeUpdate: record => {
            record.updatedAt = new Date();
        }
    },
});

let isInitialized = false;

async function initializeAntiDeleteSettings() {
    if (isInitialized) return;
    try {
        await AntiDelDB.sync({ alter: true }); // Utilisation d'ALTER TABLE pour les migrations
        
        const existingRecord = await AntiDelDB.findByPk(1);
        
        if (!existingRecord) {
            await AntiDelDB.create({ 
                id: 1, 
                status: config.ANTI_DELETE || false,
                groupDeletion: true,
                privateDeletion: true
            });
        } else {
            // Migration pour les nouvelles colonnes
            if (existingRecord.groupDeletion === undefined) {
                await AntiDelDB.update({ 
                    groupDeletion: true,
                    privateDeletion: true
                }, { where: { id: 1 } });
            }
        }
        
        isInitialized = true;
        console.log('[SUCCESS] AntiDelete settings initialized');
    } catch (error) {
        console.error('Error initializing anti-delete settings:', error);
        // Tentative de récupération en cas d'erreur grave
        try {
            await AntiDelDB.sync({ force: true });
            await AntiDelDB.create({ 
                id: 1, 
                status: config.ANTI_DELETE || false,
                groupDeletion: true,
                privateDeletion: true
            });
            isInitialized = true;
            console.log('[RECOVERY] AntiDelete table recreated');
        } catch (recoveryError) {
            console.error('Critical failure in AntiDelete initialization:', recoveryError);
        }
    }
}

async function setAnti(status, options = {}) {
    try {
        await initializeAntiDeleteSettings();
        const updateData = { status };
        
        // Gestion des options supplémentaires
        if (options.groupDeletion !== undefined) {
            updateData.groupDeletion = options.groupDeletion;
        }
        if (options.privateDeletion !== undefined) {
            updateData.privateDeletion = options.privateDeletion;
        }
        if (options.logChannel !== undefined) {
            updateData.logChannel = options.logChannel;
        }
        
        const [affectedRows] = await AntiDelDB.update(updateData, { 
            where: { id: 1 } 
        });
        
        return affectedRows > 0;
    } catch (error) {
        console.error('Error setting anti-delete status:', error);
        return false;
    }
}

async function getAnti() {
    try {
        await initializeAntiDeleteSettings();
        const record = await AntiDelDB.findByPk(1);
        
        return record ? {
            status: record.status,
            groupDeletion: record.groupDeletion,
            privateDeletion: record.privateDeletion,
            logChannel: record.logChannel,
            lastUpdated: record.updatedAt
        } : {
            status: config.ANTI_DELETE || false,
            groupDeletion: true,
            privateDeletion: true,
            logChannel: '',
            lastUpdated: new Date()
        };
    } catch (error) {
        console.error('Error getting anti-delete status:', error);
        return {
            status: config.ANTI_DELETE || false,
            groupDeletion: true,
            privateDeletion: true,
            logChannel: '',
            lastUpdated: new Date()
        };
    }
}

module.exports = {
    AntiDelDB,
    initializeAntiDeleteSettings,
    setAnti,
    getAnti,
};
