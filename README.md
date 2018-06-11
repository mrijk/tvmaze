# tvmaze
tvmaze scraper

Usage
-----

This demo tvmaze scraper exposes a single endpoint:

```
/cast?limit=<LIMIT>&page=<PAGE>
```

LIMIT has a default value of 10
PAGE has a default value of 1

Example (using [https://tvmaze4rtl.herokuapp.com/cast?limit=1&page=10](https://tvmaze4rtl.herokuapp.com/cast?limit=1&page=10))

```bash
$ curl "https://tvmaze4rtl.herokuapp.com/cast?limit=1&page=10" | jq .
```

Will return the 10th page, limited to 1 document:

```javascript
[
  {
    "id": 10,
    "name": "Grimm",
    "cast": [
      {
        "id": 1516,
        "name": "Bitsie Tulloch",
        "birthday": "1981-01-19"
      },
      {
        "id": 1514,
        "name": "David Giuntoli",
        "birthday": "1980-06-18"
      },
      {
        "id": 1521,
        "name": "Claire Coffee",
        "birthday": "1980-04-14"
      },
      {
        "id": 1520,
        "name": "Bree Turner",
        "birthday": "1977-03-10"
      },
      {
        "id": 1519,
        "name": "Reggie Lee",
        "birthday": "1974-10-04"
      },
      {
        "id": 1515,
        "name": "Russell Hornsby",
        "birthday": "1974-05-15"
      },
      {
        "id": 1518,
        "name": "Sasha Roiz",
        "birthday": "1973-10-21"
      },
      {
        "id": 1517,
        "name": "Silas Weir Mitchell",
        "birthday": "1969-09-30"
      }
    ]
  }
]
```

Deployment
----------

We deployed a MongoDB instance on https://cloud.mongodb.com/

The application itself is deployed on Heroku.

Implementation details
----------------------

RxJS was used to handle throttling. This is a bit of overkill for this single use-case, but it allows for nice
extensions in the future.
