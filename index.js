const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'), 
    uuid = require('uuid'),
    bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
//Creates a write stream (in append mode). A 'log.txt' file is created in root directory 
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

let movies = [
    {"title": "1. Roma"},
    {"title": "2. Marriage Story"},
    {"title": "3. Groundhog Day"}, 
    {"title": "4. Black Panther"},
    {"title": "5. Mudbound"},
    {"title": "6. The Dark Knight"},
    {"title": "7. Past Lives"},
    {"title": "8. Shrek"},
    {"title": "9. The Devil Wears Prada"},
    {"title": "10. Home Alone"}
];

//.use() function to appear before specifiying routes/paths
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/', (req, res) => {
    res.send('Catch all your favourite movies on demand!');
});

//Error handling function to be declared directly before the listen function. Note: Takes 4 arguments
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});