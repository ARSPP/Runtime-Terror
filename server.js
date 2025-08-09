const express = require('express');

process.chdir(__dirname);

const loginApp = require('./Backend/login.js');
const restaurantsEP = require('./Backend/restaurants.js');

const app = express();
const port = 3000;

if (process.env.NODE_ENV == "production") {
	host = "0.0.0.0";
}else{
    host = "localhost";
}



app.use('/', restaurantsEP);
app.use('/', loginApp);

app.use(express.static('frontend'));

app.listen(port, host, () => {
	console.log(`http://${host}:${port}`);
});
