const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const port = 3000;

// Serve main.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    open(`http://localhost:${port}`);
});
