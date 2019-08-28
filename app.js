var express = require('express'),
    app = express(),
    path = require('path');
    bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html.html'));
});

app.listen(3000, (req, res) => {
    console.log('server is running');
});