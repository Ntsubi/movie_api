const express = require('express');
const app = express();

app.get('/movies', (req, res) => {
    res.json('My top 10 movies');
});

app.get('/', (req, res) => {
    res.send('Catch all your favourite movies on demand!');
});
app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});