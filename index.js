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

let movies = [
    {
        "Title": "Roma",
        "Director": "Alfonso Cuarón",
        "Description": "Cleo is one of two domestic workers who help Antonio and Sofía take care of their four children in 1970s Mexico City. Complications soon arise when Antonio suddenly runs away with his mistress and Cleo finds out that she's pregnant. When Sofía decides to take the kids on vacation, she invites Cleo for a much-needed getaway to clear her mind and bond with the family.",
        "Genre": "Drama",
        "ImageURL": "https://upload.wikimedia.org/wikipedia/en/8/85/Roma_theatrical_poster.png"
    },

    {
        "Title": "Marriage Story",
        "Director": "Noah Baumbach",
        "Description": "A stage director and his actor wife struggle through a gruelling, coast-to-coast divorce that pushes them to their personal and creative extremes.",
        "Genre": "Comedy/Romance",
        "ImageURL": "https://m.media-amazon.com/images/M/MV5BZGVmY2RjNDgtMTc3Yy00YmY0LTgwODItYzBjNWJhNTRlYjdkXkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_.jpg"
    },

    {
        "Title": "Past Lives",
        "Director": "Celine Song",
        "Description": "Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after Nora's family emigrates from South Korea. Decades later, they are reunited for one fateful week as they confront destiny, love and the choices that make a life.",
        "Genre": "Romance/Drama",
        "ImageURL": "data:image/jpeg;base64,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"
    },

    {
        "Title": "Black Panther",
        "Director": "Ryan Coogler",
        "Description": "After the events of Captain America: Civil War, Prince T'Challa returns home to the reclusive, technologically advanced African nation of Wakanda to serve as his country's new king. However, T'Challa soon finds that he is challenged for the throne from factions within his own country. When two foes conspire to destroy Wakanda, the hero known as Black Panther must team up with C.I.A. agent Everett K. Ross and members of the Dora Milaje, Wakandan special forces, to prevent Wakanda from being dragged into a world war.",
        "Genre": "Action",
        "ImageURL": "https://img.redbull.com/images/c_crop,x_695,y_0,h_1440,w_1152/c_fill,w_400,h_540/q_auto:low,f_auto/redbullcom/2018/02/06/62ed85b8-13e7-4f76-bbc4-f6a4a16b7f00/black-panther"
    },

    {
        "Title": "Mudbound",
        "Director": "Dee Rees",
        "Description": "After returning from the horrors of the Second World War, two war veterans must deal with everyday life in the Mississippi Delta farm and struggle with the memories of combat.",
        "Genre": "Drama",
        "ImageURL": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjLkgY1RZMSgopGjsrvWXZ9CyM7RqbbO47og&usqp=CAU"
    }
];

//.use() function to appear before specifiying routes/paths

app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.status(200).json(movie);
        console.log(movie.Title);
    } else {
        res.status(400).send('Sorry, we couldn\'t find this title.')
    }
})

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