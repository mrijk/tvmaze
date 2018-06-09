# tvmaze
tvmaze scraper

Usage
-----

This demo tvmaze scraper exposes a single endpoint:

/cast?limit=<LIMIT>&page=<PAGE>

LIMIT has a default value of 10
PAGE has a default value of 1

Deployment
----------

We deployed a MongoDB instance on https://cloud.mongodb.com/

The appication itself is deployed on Heroku: 

Implementation details
----------------------

RxJS was used to handle throttling. This is a bit of overkill for this single use-case, but it allows for nice
extensions in the future.
