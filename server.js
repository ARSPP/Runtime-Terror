const express = require('express');

const loginApp = require('./Backend/login.js');
const restaurantsEP = require('./Backend/restaurants.js');

const app = express();
const port = 3000;


app.use('/', restaurantsEP);
app.use('/', loginApp);

app.use(express.static('frontend'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});