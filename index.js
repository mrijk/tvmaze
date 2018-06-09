const {keys, partial} = require('lodash');

const express = require('express');
const paginate = require('express-paginate');

const {from, pipe, interval} = require('rxjs');
const {delay, take, zip} = require('rxjs/operators');

const {connectToDatabase, getCast, storeCast} = require('./database');
const {getAllShows, getShow} = require('./tvmaze');

const THROTTLE = 300;

function update(db) {
    getAllShows()
        .then(partial(parseAndStoreShows, db))
        .catch(error => console.log(error));
    
    // Fire and forget, don't wait for thousands of updates to complete
    return {
        status: 'OK'
    };
}

function parseAndStoreShows(db, shows) {
    const ids = keys(shows); 
    console.log(`Found ${ids.length} shows`);

    // Build source with throttle
    const source = from(ids)
          .pipe(
              zip(interval(THROTTLE), (a,) => a),
              take(100));
    
    source.subscribe(
        id => getShow(id).then(partial(storeCast, db)),
        error =>  console.log('Error: ' + error),
        () => console.log('Completed')
    );
}

function startServer() {
    connectToDatabase().then(client => {
        
        const dbName = 'tvmaze4rtl';
        const db = client.db(dbName);

        const app = express();
        app.use(paginate.middleware(10, 50));
        
        app.set('port', process.env.PORT || 5000);

        app.get('/cast', (req, res) => {
            const {limit} = req.query;
            const {skip} = req;
            getCast(db, skip, limit)
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
