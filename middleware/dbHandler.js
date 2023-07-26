const mongoose = require("mongoose")
/**
 * @return db Name
 */
const getDbName = async (headers) => {
    let dbName = null;
    let authHeader = headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    dbName = parseJwt(token).db_name;
    return dbName;
}

const getSitesId = async (headers) => {
    let siteMid = null;
    let authHeader = headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    siteMid = parseJwt(token).sites;
    return siteMid;
}

const getDeptName = async (headers) => {
    let deptName = null;
    let authHeader = headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    deptName = parseJwt(token).department;
    return deptName;
}

const getRole = async (headers) => {
    let roleList = null;
    let authHeader = headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    roleList = parseJwt(token).role;
    return roleList;
}

/**
 * @return parsed token
 */
function parseJwt(token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}


/** Switch db on same connection pool
 * @return new connection
 */
const switchDB = async (dbName) => {
    if (dbName) {
        const db = mongoose.connection.useDb(dbName, { useCache: true })
        // console.log("connection switchDB", dbName);
        return db
    }
    throw new Error('error')
}

/**
 * @return model from mongoose
 */
const getDBModel = async (db, modelName, schema) => {
    return db.model(modelName, schema)
}

/**
 * @return Schema
 */
const returnDbSchema = async (headers, modelName, schema) => {
    let dbName = await dbService.getDbName(headers);
    let db = await switchDB(dbName);
    let schemaModel = await getDBModel(db, modelName, schema);
    return schemaModel;
}



const dbService = {
    getDbName,
    getSitesId,
    getDeptName,
    getRole,
    switchDB,
    getDBModel,
    returnDbSchema
}

module.exports = { dbService };