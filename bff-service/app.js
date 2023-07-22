const axios = require('axios').default;
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.all('/*', (req, res) => {

  //console.log('origURL'. req.originalUrl);
  console.log('method', req.method);
  console.log('body', req.body);

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
        'Authorization': 'Basic ' + process.env.TOKEN,
      }
    };
    
    console.log('axiosConfig:', axiosConfig);

    axios(axiosConfig)
    .then(function (response) {
      console.log('recipient response', response.data);
      res.json(response.data);
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
