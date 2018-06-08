const _ = require('lodash');

const assert = require('assert');

const Promise = require("bluebird");

const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const { from, pipe, interval } = require('rxjs');
const { delay, take, zip} = require('rxjs/operators');

const rp = require('request-promise');

const uri = 'mongodb+srv://tvmaze4rtl:pFS1JCA2tFe7TDiy@cluster0-snmrb.mongodb.net/test?retryWrites=true'

function connectToDatabase() {
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

function getShow(id) {
    const options = {
        uri: `http://api.tvmaze.com/shows/${id}?embed=cast`,
        json: true
    }
    
    return rp(options)
        .then(extractCast)
        .catch(error => {
            console.log(`Error while getting show ${id}`);
        });
}

function extractCast({id, name, _embedded}) {
    const {cast} = _embedded;

    const extractPerson = ({person: {id, name, birthday}}) => ({id, name, birthday});
    
    return {
        id,
        name,
        cast: _.orderBy(_.map(cast, extractPerson), 'birthday', 'desc')
    };
}

function storeCast(db, cast) {
    console.log(cast);
    const collection = db.collection('cast');
    collection.insert(cast, (err, result) => {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log("Inserted 1 document into the collection");
    });
}

function getCast(db) {
    return new Promise((resolve, reject) => {
        db.collection('cast').find({}, {projection: {_id: 0}}).toArray((error, items) => {
            if (error) {
                reject(error);
            } else {
                resolve(items);
            }
        });
    });    
}

function update(db) {
    const options = {
        uri: 'http://api.tvmaze.com/updates/shows',
        json: true
    }
    
    rp(options)
        .then(shows => {
            const keys = _.keys(shows); 
            const len = keys.length;
            console.log(`Success, found ${len} shows`);

            // Build source with throttle of 100 milliseconds
            const source = from(keys)
                  .pipe(
                      zip(interval(500), (a,) => a),
                      take(100)
                  );
            
            const subscription = source.subscribe(
                id => {
                    getShow(id)
                        .then(show => storeCast(db, show));
                },
                err =>  {
                    console.log('Error: ' + err);
                },
                () => console.log('Completed')
            );
        })
        .catch(error => {
            console.log('Error');
        });

    // Fire and forget, don't wait for thousands of updates to complete
    return {
        status: 'OK'
    };
}

function startServer() {
    console.log('Started server');

    connectToDatabase().then(client => {
        
        const dbName = 'tvmaze4rtl';
        const db = client.db(dbName);

        const app = express();
        app.set('port', process.env.PORT || 5000);

        app.get('/cast', (req, res) => {
            getCast(db)
                .then(result => res.send(result));
        });
        
        app.get('/update', (req, res) => {
            res.send(update(db));
        });
        
        app.listen(app.get('port'), () => {
            console.log('tvmaze4rtl is running on port', app.get('port'));
            
        });
    });
}

startServer();
