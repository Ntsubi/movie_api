const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    uuid = require('uuid'),
    bodyParser = require('body-parser');
    mongoose = require('mongoose');
    Models = require('./models.js');
    Movies = Models.Movie;
    Users = Models.User;

mongoose.connect('mongodb://localhost:27017/moviesDB',{ useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
    Movies.find()
    .then((movies) => {
        res.status(200).json(movies);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send('Erro: ' + err);
    })
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
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
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
  app.get('/users', async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(200).json(users);
    })
    .catch((err) => {
        res.status(500).send('Error: ' + err);
    });
  });

 //Return data on a specific user by name
 app.get('/users/:Username', async (req, res) => {
    await Users.findOne({Username: req.params.Username})
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            res.status(500).send('Error: ' + err);
        });
 });
 
 
//Update (PUT method) user info by username 
app.put('/users/:Username', async (req, res) => {
   await Users.findOneAndUpdate({Username: req.params.Username}, 
    {$set: 
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send('Error: ' + err);
    })
});
   

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