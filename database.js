const MongoClient = require('mongodb').MongoClient;
const Promise = require("bluebird");

const getCastCollection = db => db.collection('cast');

function connectToDatabase() {
    const uri = process.env.MONGODB_URI;

    return new Promise((resolve, reject) => {
    
        MongoClient.connect(uri, (error, client) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(client);
        });
    });
}

function getCast(db, skip, limit) {
    const options = {
        limit,
        skip,
        projection: {_id: 0}
    };
    
    return new Promise((resolve, reject) => {
        getCastCollection(db).find({}, options).toArray((error, items) => {
            if (error) {
                reject(error);
            } else {
                resolve(items);
            }
        });
    });    
}

function storeCast(db, cast) {
    getCastCollection(db).insert(cast, (err, result) => {
        console.log(`Inserted document ${cast.id} into the collection`);
    });
}

module.exports = {
    connectToDatabase,
    getCast,
    storeCast
};
