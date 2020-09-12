const host = process.env.NODE_ENV !== 'production' ? process.env.HOST_LOCAL : process.env.HOST;
const port = process.env.PORT;
const endpoint = `${process.env.ENDPOINT}/${process.env.APP_NAME.toLowerCase().split(' ').join('-')}`;

module.exports = {
    app: {
        databaseURI: process.env.DB_URI,
        appId: process.env.APP_ID,
        masterKey: process.env.APP_MASTERKEY,
        javascriptKey: process.env.APP_JAVASCRIPKEY,
        serverURL: `${host}:${port}/${endpoint}`,
        endpoint: endpoint,
        port: port,
        cloud: './cloud/main.js',
        liveQuery: {
            classNames: ["controle_versao", 'agendamento']
        }
    }

};