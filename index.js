const _ = require('lodash');

const express = require('express');

const { from, pipe, interval } = require('rxjs');
const { delay, take, zip} = require('rxjs/operators');

const rp = require('request-promise');

function getShow(id) {
    const options = {
        uri: `http://api.tvmaze.com/shows/${id}`,
        json: true
    }
    
    rp(options)
        .then(({name}) => {
            console.log(`Found: ${name}`);
        })
        .catch(error => {
            console.log(`Error while getting show ${id}`);
        });
}

function update() {
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
                  .pipe(zip(interval(100), (a,) => a))
                  .pipe(take(10))
            
            const subscription = source.subscribe(
                getShow,
                err =>  {
                    console.log('Error: ' + err);
                },
                () => console.log('Completed')
            );
        })
        .catch(error => {
            console.log('Error');
        });

    return {
        updates: 42
    };
}

function startServer() {
    console.log('startServer');

    const app = express();

    app.get('/update', (req, res) => {
        res.send(update());
    });

    app.listen(8000, () => console.log('tvmaze is listening on port 3000'));    
}

startServer();
