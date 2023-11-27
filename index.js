const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    uuid = require('uuid'),
    bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
//Creates a write stream (in append mode). A 'log.txt' file is created in root directory 
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

//.use() function to appear before specifiying routes/paths
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

//Directs user to the index page 
app.get('/', (req, res) => {
    res.send('Catch all your favourite movies on demand!');
});

//Routes to the movies URL and returns the entire list of movies in the array/database
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

//The parameter title allows you to narrow search by title. 
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Sorry, we couldn\'t find this title.')
    }
})

//The parameter genreName allows you to narrow search by genre
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('Sorry, we couldn\'t find this genre.')
    }
})

//The parameter director allows you to narrow search by genre
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('Sorry, we couldn\'t find this director.')
    }
})

//Creating a new user with the POST method. The request requires a JSON object & the response will return a JSON object
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Users need names.')
    }
})

//Allowing users to update (PUT method) their names 
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('This user couldn\'nt be found.')
    }
})

//Adding a movie to the array
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to ${id}'s array.`);
    } else {
        res.status(400).send('This user couldn\'nt be found.')
    }
})

//Deletes a movie from a user's array
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from ${id}'s array.`);
    } else {
        res.status(400).send('This user couldn\'nt be found.')
    }
})

//Deregisters a user
app.delete('/users/:id/', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted.`);
    } else {
        res.status(400).send('This user couldn\'nt be found.')
    }
})

//Error handling function to be declared directly before the listen function. Note: Takes 4 arguments
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080');
});