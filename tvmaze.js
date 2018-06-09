const _ = require('lodash');

const rp = require('request-promise');

function getAllShows() {
    const options = {
        uri: 'http://api.tvmaze.com/updates/shows',
        json: true
    }
    
    return rp(options);
}

function getShow(id) {
    const options = {
        uri: `http://api.tvmaze.com/shows/${id}?embed=cast`,
        json: true
    }
    
    return rp(options)
        .then(extractCast)
        .catch(error => {
            console.log(error);
            console.log(`Error while getting show ${id}`);
        });
}

function extractCast({id, name, _embedded: {cast}}) {
    const extractPerson = ({person: {id, name, birthday}}) => ({id, name, birthday});
    
    return {
        id,
        name,
        cast: _.orderBy(_.map(cast, extractPerson), 'birthday', 'desc')
    };
}

module.exports = {
    getAllShows,
    getShow
};
