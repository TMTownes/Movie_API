const express = require ('express');
const morgan = require('morgan');
const fs = require('fs'); //import built-in node modules fs and path
const path = require('path');
const app = express(); 
//'log.txt' file created in root
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

//setup Logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public')); //routes all requests for static files to their reapective files on the server



app.get('/', (req,res) => {
    let responseText = 'Welcome to my app? ';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
});

app.get('/documentation.html', (req,res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

const bodyParser = require('body-parser'),
    methodOverride = require('method-override');

app.use(bodyParser.urlencoded({
        extended: true
    }));
app.use(bodyParser.json());
app.use(methodOverride());
//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// const http = require('http');


// http.createServer((request, response) => {
//   response.writeHead(200, {'Content-Type': 'text/plain'});
//   response.end('Welcome to my book club!\n');
// }).listen(8080);

// console.log('My first Node test server is running on Port 8080.');