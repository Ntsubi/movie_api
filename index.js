const express = require('express');
    morgan = require('morgan');
    fs = require('fs');
    path = require('path'); 

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}));

let myTopTen = [
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

app.get('/movies', (req, res) => {
    res.json(myTopTen);
});

app.get('/', (req, res) => {
    res.send('Catch all your favourite movies on demand!');
});
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});