let express = require('express');

let app = express();
let port = 3000;
let host = "localhost"


app.use(express.static("frontend"));
app.use(express.json());

// Serve main.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/restaurants', (req, res) => {
    
})

app.listen(port, () => {
    console.log(`Server running at ${host} on port ${port}`);
});
