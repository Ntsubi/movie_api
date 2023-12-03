const express = require('express');
const { check, validationResult } = require('express-validator'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    uuid = require('uuid'),
    bodyParser = require('body-parser');
    mongoose = require('mongoose');
    Models = require('./models.js');
    Movies = Models.Movie;
    Users = Models.User;

// mongoose.connect('mongodb://0.0.0.0:27017/moviesDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'https://render.com'];

app.use(cors( {
    origin: (origin, callback) => {
        if (!origin) return callback (null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback (new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app); //(app) ensures that Express is available in the auth.js file as well
const passport = require('passport');
    require('./passport');

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
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});

//The parameter title allows you to narrow search by title. 
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie)
        })
        .catch((err) => {
            res.status(400).send('Sorry, we couldn\'t find that title.');
        })
});

//The parameter genreName allows you to narrow search by genre
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.genreName })
        .then((movie) => {
            res.status(200).json(movie.Genre)
        })
        .catch((err) => {
            res.status(400).send('Sorry, we couldn\'t find that genre.');
        })
});

//The parameter director allows you to narrow search by genre
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.directorName })
        .then((movie) => {
            res.status(200).json(movie.Director)
        })
        .catch((err) => {
            res.status(400).send('Sorry, we couldn\'t find that director.');
        })
});

//Creating a new user with the POST method. The request requires a JSON object & the response will return a JSON object
app.post('/users', [ 
    check('Username', 'Username must be at least 5 characters long').isLength({min: 5}), 
    check('Username', 'Username contains non-alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()],  

    async (req, res) => {
    let errors = validationResult(req);
        if (!errors.isEmpty()) { 
            return res.status(422).json({ errors: errors.array() });
        }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })

        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + 'already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

//Retrieve data on all users using the GET method
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            res.status(500).send('Error: ' + err);
        });
});

//Return data on a specific user by name
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            res.status(500).send('Error: ' + err);
        });
});


//Update (PUT method) user info by username 
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
    check('Username', 'Username must be at least 5 characters long').isLength({min: 5}),
    check('Username', 'Username is required').isAlphanumeric() ], 
    
    async (req, res) => {
    let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
            if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: req.body.Password,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});


//Adding a movie to a users favorite movies array
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $push: { FavoriteMovies: req.params.MovieID }
        },
        { new: true }) // This line makes sure that the updated document is returned
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});

//Deletes a movie from a user's array
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true })
        .then((updatedUser) => {
            res.status(200).json(updatedUser)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: + err');
        })
});

//Delete a user by username
app.delete('/users/:Username/', passport.authenticate('jwt', { session: false }), async (req, res) => {
        if (req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission denied');
        }
    await Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found.')
            } else {
                res.status(200).send(req.params.Username + ' has been deleted.')
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});

//Error handling function to be declared directly before the listen function. Note: Takes 4 arguments
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});