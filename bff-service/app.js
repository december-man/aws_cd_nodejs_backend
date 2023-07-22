const axios = require('axios').default;
const express = require('express');
const path = require('path');
require('dotenv').config();
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3001;
// Set cache refresh time to 2 minutes
const cache = new NodeCache({ stdTTL: 120 });

app.use(express.json());

// check for cache in case of GET /products request
app.get('/products', (req, res, next) => {
  const cachedProducts = cache.get(req.originalUrl);
  if (cachedProducts) {
    console.log('Returning cached products')
    return res.send(cachedProducts);
  }
  next();
});

app.all('/*', (req, res) => {
  //console.log('origURL'. req.originalUrl);
  console.log('method', req.method);
  console.log('body', req.body);
  console.log('Auth', req.headers.authorization);
  const token = req.headers.authorization;
  const recipient = req.originalUrl.split('/')[1];
  console.log('Recipient:', recipient);
  
  const recipientURL = process.env[recipient];
  console.log('RecipientURL:', recipientURL);
  if (recipientURL) {
    const axiosConfig = {
      method: req.method,
      url: `${recipientURL}${req.originalUrl}`,
      ...(Object.keys(req.body || {}).length > 0 && {data: req.body}),
      headers: {
        'Authorization': token,
      }
    };
    
    console.log('axiosConfig:', axiosConfig);

    axios(axiosConfig)
    .then(function (response) {
      console.log('recipient response', response.data);
      res.json(response.data);
      // cache response for GET /products request
      if (req.method == 'GET' && recipient == 'products') {
        cache.set(req.originalUrl, response.data)
        console.log('Caching products')
      };
    })
    .catch(error =>{
      console.log('ERROR:', JSON.stringify(error));

      if (error.response) {
        const {
          status,
          data
        } = error.response

        res.status(status).json(data)
      } else {
        res.status(500).json({error: error.message});
      }
    });
  } else {
    res.status(502).json({error: 'Cannot process request'});
  }
})

app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`)
});
