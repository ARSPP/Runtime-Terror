const express = require('express');
const path = require('path');
//const open = require('open');

const loginApp = require('./Backend/login.js');

const app = express();
const port = 3000;

app.use('/', loginApp);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    //open(`http://localhost:${port}`);
});