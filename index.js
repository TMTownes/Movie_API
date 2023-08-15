const express = require ('express'),
    morgan = require('morgan'),
    fs = require('fs'), //import built-in node modules fs and path
    path = require('path'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    {check, validationResult} = require('express-validator'),
    dotenv = require('dotenv').config();


const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genres;

//Local Database
// mongoose.connect('mongodb://localhost:27017/cfDB', {
//     useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const app = express(); 

//'log.txt' file created in root
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});
//Parser/Handling
const bodyParser = require('body-parser'),
    methodOverride = require('method-override');

app.use(bodyParser.urlencoded({
        extended: true
    }));

app.use(bodyParser.json());
app.use(methodOverride());

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'https://myflix-retro-af49f4e11172.herokuapp.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            //if specific origin not found on allowed list
            let message = 'The CORS policy for this application does not allow access from origin' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

//Authentication import
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

//setup Logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public')); //routes all requests for static files to their reapective files on the server

//Home Page
app.get('/', (req,res) => {
    let responseText = 'Welcome to myFlix! Millennial Movies ';
    // responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
});

//Documentation Page
app.get('/documentation.html', (req,res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
});

//Sample Array 'movies'
// let movies = [
//     {
//         id: 1, 
//         Title: 'E.T.',
//         genre: {
//             Name:'Children\'s',
//             genreDescription: 'Movies with family-friendly content.'
//         },
//         director: {
//             name: 'Steven Spielberg',
//             birthYear: 1946,
//             deathYear: 'N/A',
//             bio: 'Steven Allan Spielberg was born December 18, 1946, in Cincinnati, Ohio. He started making amateur films while in his teens and later studied film at California State University, Long Beach. Among his award winning, blockbuster films are the Indiana Jones original trilogy (1981-89), The Color Purple (1985), Jurassic Park (1993), Schindler\'s List (1993), Saving Private Ryan (1998), Minority Report (2002), Amistad (1997), War Horse (2011), and the musical West Side Story(2021).'
//         },
//         description: 'An alien stranded on Earth befriends a young boy, who later with the help of his friends and sister, help to the alien return home to space.',
//         image: './img/E.T.',
//         featured: 'Y'
//     },
//     {
//         id: 2,
//         Title: 'Hook',
//         genre: {
//             Name:'Adventure',
//             genreDescription: 'Movies with action and a moral lesson.'
//         },
//         director: {
//             name: 'Steven Spielberg',
//             birthYear: 1946,
//             deathYear: 'N/A',
//             bio: 'Steven Allan Spielberg was born December 18, 1946, in Cincinnati, Ohio. He started making amateur films while in his teens and later studied film at California State University, Long Beach. Among his award winning, blockbuster films are the Indiana Jones original trilogy (1981-89), The Color Purple (1985), Jurassic Park (1993), Schindler\'s List (1993), Saving Private Ryan (1998), Minority Report (2002), Amistad (1997), War Horse (2011), and the musical West Side Story(2021).'
//         },
//         description: 'When his young children are abducted by his old nemesis, Capt. Hook (Dustin Hoffman), middle-aged lawyer Peter Banning (Robin Williams) returns to his magical origins as Peter Pan to get them back.',
//         image: './img/Hook',
//         featured: 'Y'
//     },
//     {
//         id: 3,
//         Title: 'Casper',
//         genre: {
//             Name:'Comedy',
//             genreDescription: 'Movies made to be humorous and engaging.'
//         },
//         director: {
//             name: 'Brad Siberling',
//             birthYear: '1963',
//             deathYear: 'N/A',
//             bio: 'Bradley Mitchell Siberling was September 8, 1963 in Washington D.C. He attended Williams College in Williamstown, MA and received a BA in English from UC Santa Barbara. He later studied film directing at the UCLA Fil School. He is best known for his feature films City of Angels(1998), Moonlight Mile(2002), Lemony Snicket\'s A Series of Unfortunate Events(2004), and Land of the Lost(2009).'
//         },
//         description: 'A kind young ghost peacefully haunts a mansion in Maine until a spirit specialist James Harvey (Bill Pullman) and his daughter, Kat (Christina Ricci) move in hoping to commuicate with the deceased Mrs. Harvey. Meanwhile Casper\'s relationship with Kat is complicated by his transparent state.',
//         image: './img/Casper',
//         featured: 'Y'
//     },
//     {
//         id: 4,
//         Title: 'Home Alone',
//         genre: {
//             Name:'Comedy',
//             Description: 'Movies made to be humorous and engaging.'
//         },
//         director: {
//             name: 'Chris Columbus',
//             birthYear: '1958',
//             deathYear: 'N/A',
//             bio: 'Born in Spangler, PA, Chris Joseph Columbus studied film at Tisch School of the Arts. He is best known for Home Alone(1990), Home Alone 2:Lost in New York(1992), Mrs. Doubtfire(1993), Harry Potter and the Sorcerer\'s Stone(2001), Harry Potter and the Chamber of Secrets(2002), The Help(2011), and Percy Jackson & the Olympians: The Lightning Thief(2010).'
//         },
//         description: 'An eight year old boy (Macaulay Culkin) is left home alone at Christmas when his family leaves for a vacation to France, and must defend his home against holiday burglars.',
//         image: './img/HomeAlone',
//         featured:'Y'
//     },
//     {
//         id: 5,
//         Title: 'The Lion King',
//         genre: {
//             Name:'Children\'s',
//             genreDescription: 'Movies with family-friendly content.'
//         },
//         director: {
//             name: 'Roger Allers, Rob Minkoff',
//             birthYear: '1949, 1962',
//             deathYear: 'N/A',
//             bio: 'Roger Allers is an American film director, screenwriter, animator, storyboard artist, and playwright. He is best known for co-directing both Lion King the feature film and the Broadway adaptation, as well as Open Season (2006). Robert Ralph Minkoff is an American filmmaker whose films include Stuart Little(1999), The Haunted Mansion (2003), and The Forbidden Kingdom (2008).'
//         },
//         description: 'Follows the story of Simba (Swahili for lion), a lion cub who destined to succeed his father but when he\'s tricked into exile must return to challenge his cruel uncle for his rightful place as King of the Pride Lands.',
//         image: './img/LionKing',
//         featured:'Y'
//     },
//     {
//         id: 6,
//         Title: 'Clueless',
//         genre: {
//             Name:'Teen',
//             genreDescription: 'Movies with a rating of PG13 and above that offer insight into the young adult experience, usually featuring some kind of coming-of-age lesson.'
//         },
//         director: {
//             name: 'Amy Heckerling',
//             birthYear: '1954',
//             deathYear: 'N/A',
//             bio: 'Amy Heckerling is an American filmmaker and actress best known for Fast Times at Ridgemont High (1982) and Look Who\'s Talking (1989).'
//         },
//         description: 'An American coming-of-age teen comedy about an elite high school student who befriends a new student and decides to give her a makeover while playing matchmaker to her teachers and examiing her own existence.',
//         image: './img/Clueless',
//         featured:'Y'
//     } 
// ];

//Sample Array 'users'
// let users = [
//     {
//         id: 1,
//         name: 'disneylover@gmail.com',
//         password: 'MinneMouse123',
//         favoriteList: []
//     },
//     {
//         id: 2,
//         name: 'adventurous1@yahoo.com',
//         password: '123LetsGo',
//         favoriteList: ['Hook']
//     },
//     {
//         id: 3,
//         name: 'pamiam@me.com',
//         password: 'BookRLife',
//         favoriteList: []
//     },
//     {
//         id: 4,
//         name: 'toripines33@gmail.com',
//         password: 'Climbing2023',
//         favoriteList: []
//     },
//     {
//         id: 5,
//         name: 'dancingqueen@gmail.com',
//         password: 'MamaMia2011',
//         favoriteList: []
//     }
// ];


//MOVIE ENDPOINTS
//READ ALL movies
app.get('/movies', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ description of movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({Title: req.params.Title})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ all genres
app.get('/genres', passport.authenticate('jwt', {session: false}), async (req,res) => {
    await Genres.find()
        .then((genres) => {
            res.json(genres);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//GET movies by genre
app.get('/movies/Genre/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.find({"Genre.Name": req.params.Name})
        .then((movieGenres) => {
            res.json(movieGenres);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//READ data about a dircetor by name
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), async (req, res) => {
    await Movies.findOne({"Director.Name": req.params.Name})
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});


//USER ENDPOINTS
//CREATE new user
/* Expect JSON in the format
{
    ID: Integer,
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
} */
app.post('/users', [
    check('Username', 'Username is required').isLength({min: 4}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) =>{
    //check validation object
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({Username: req.body.Username})
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users.create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) => {res.status(201).json(user)})
            .catch((error) =>{
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

//READ all users
app.get('/users', passport.authenticate('jwt', {session: false}), async (req, res) => {
    //Condition Check
    if (req.user.Username != req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    //End Condition
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//GET a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), async(req, res) => {
    //Condition Check
    if (req.user.Username != req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    //End Condition
    await Users.findOne({Username: req.params.Username})

    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});
//UPDATE user info (username)
/*Expect Json:
{
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
} */
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
], async (req, res) => {
    //Conditions Check
    if (req.user.Username != req.params.Username) {
        return res.status(400).send('Permission denied');
    }

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    //End Conditions
    await Users.findOneAndUpdate({Username: req.params.Username}, {$set: 
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
},
{new: true}) //Makes sure the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Update director info
/* Expect JSON
{
    Name: String, (required)
    Bio: String (required) 
} */
// app.post('/movies/Director/:Name', async (req, res) => {
//     await Movies.findOneAndUpdate({"Director.Name": req.params.Name}, {
//         $set: {
//             Name: req.body.Name,
//             Bio: req.body.Bio,
//             Birth: req.body.Birth,
//             Death: req.body.Death
//         }
//     },
//     {new: true})
//         .then((updatedDirector) => {
//             res.json(updatedDirector);
//         })
//         .catch((err) => {
//             console.error(err);
//             res.status(500).send('Error: ' + err);
//         });
// });


//UPDATE movie to user's favoriteMovies. Consider using "$addToSet" instead of "$push"
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Username', 'Username is required').not().isEmpty()
],

async (req, res) => {
    //Condition Check
    if (req.user.Username != req.params.Username) {
        return res.status(400).send('Permission denied');
    }

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    //End Condition
    await Users.findOneAndUpdate({Username: req.params.Username}, {
        $push: {FavoriteMovies: req.params.MovieID}
    },
    {new: true}) //Makes sure updated document is returned
    .then ((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//DELETE movie from user favoriteList. Same as add, but use $pull
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req,res) => {
   //Condition Check
   if (req.user.Username != req.params.Username) {
    return res.status(400).send('Permission denied');
}
//End Condition
    await Users.findOneAndUpdate({Username: req.params.Username}, {
        $pull: {FavoriteMovies: req.params.MovieID}
    },
    {new: true})
        .then((removeMovie) => {
            res.json(removeMovie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//DELETE user, return text that user email has been removed
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    //Condition Check
    if (req.user.Username != req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    //End Condition
    await Users.findOneAndRemove({Username: req.params.Username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
}); 

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// app.listen(8080, () => {
//     console.log('Your app is listening on port 8080.');
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

