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
let movies = [
    {
        id: 1, 
        title: 'E.T.',
        director: {
            name: 'Steven Spielberg',
            birthYear: 1946,
            deathYear: 'N/A',
            bio: 'Steven Allan Spielberg was born December 18, 1946, in Cincinnati, Ohio. He started making amateur films while in his teens and later studied film at California State University, Long Beach. Among his award winning, blockbuster films are the Indiana Jones original trilogy (1981-89), The Color Purple (1985), Jurassic Park (1993), Schindler\'s List (1993), Saving Private Ryan (1998), Minority Report (2002), Amistad (1997), War Horse (2011), and the musical West Side Story(2021).'
        },
        description: 'An alien stranded on Earth befriends a young boy, who later with the help of his friends and sister, help to the alien return home to space.',
        image: './img/E.T.',
        featured: 'Y'
    },
    {
        id: 2,
        title: 'Hook',
        director: {
            name: 'StevenSpielberg',
            birthYear: 1946,
            deathYear: 'N/A',
            bio: 'Steven Allan Spielberg was born December 18, 1946, in Cincinnati, Ohio. He started making amateur films while in his teens and later studied film at California State University, Long Beach. Among his award winning, blockbuster films are the Indiana Jones original trilogy (1981-89), The Color Purple (1985), Jurassic Park (1993), Schindler\'s List (1993), Saving Private Ryan (1998), Minority Report (2002), Amistad (1997), War Horse (2011), and the musical West Side Story(2021).'
        },
        description: 'When his young children are abducted by his old nemesis, Capt. Hook (Dustin Hoffman), middle-aged lawyer Peter Banning (Robin Williams) returns to his magical origins as Peter Pan to get them back.',
        image: './img/Hook',
        featured: 'Y'
    },
    {
        id: 3,
        title: 'Casper',
        director: {
            name: 'Brad Siberling',
            birthYear: '1963',
            deathYear: 'N/A',
            bio: 'Bradley Mitchell Siberling was September 8, 1963 in Washington D.C. He attended Williams College in Williamstown, MA and received a BA in English from UC Santa Barbara. He later studied film directing at the UCLA Fil School. He is best known for his feature films City of Angels(1998), Moonlight Mile(2002), Lemony Snicket\'s A Series of Unfortunate Events(2004), and Land of the Lost(2009).'
        },
        description: 'A kind young ghost peacefully haunts a mansion in Maine until a spirit specialist James Harvey (Bill Pullman) and his daughter, Kat (Christina Ricci) move in hoping to commuicate with the deceased Mrs. Harvey. Meanwhile Casper\'s relationship with Kat is complicated by his transparent state.',
        image: './img/Casper',
        featured: 'Y'
    },
    {
        id: 4,
        title: 'Home Alone',
        director: {
            name: 'Chris Columbus',
            birthYear: '1958',
            deathYear: 'N/A',
            bio: 'Born in Spangler, PA, Chris Joseph Columbus studied film at Tisch School of the Arts. He is best known for Home Alone(1990), Home Alone 2:Lost in New York(1992), Mrs. Doubtfire(1993), Harry Potter and the Sorcerer\'s Stone(2001), Harry Potter and the Chamber of Secrets(2002), The Help(2011), and Percy Jackson & the Olympians: The Lightning Thief(2010).'
        },
        description: 'An eight year old boy (Macaulay Culkin) is left home alone at Christmas when his family leaves for a vacation to France, and must defend his home against holiday burglars.',
        image: './img/HomeAlone',
        featured:'Y'
    },
    {
        id: 5,
        title: 'The Lion King',
        director: {
            name: 'Roger Allers, Rob Minkoff',
            birthYear: '1949, 1962',
            deathYear: 'N/A',
            bio: 'Roger Allers is an American film director, screenwriter, animator, storyboard artist, and playwright. He is best known for co-directing both Lion King the feature film and the Broadway adaptation, as well as Open Season (2006). Robert Ralph Minkoff is an American filmmaker whose films include Stuart Little(1999), The Haunted Mansion (2003), and The Forbidden Kingdom (2008).'
        },
        description: 'Follows the stort of Simba (Swahili for lion), a lion cub who destined to succeed his father but when he\'s tricked into exile must return to challenge his cruel uncle for his rightful place as King of the Pride Lands.',
        image: './img/LionKing',
        featured:'Y'
    },
    {
        id: 6,
        title: 'Clueless',
        director: {
            name: 'Amy Heckerling',
            birthYear: '1954',
            deathYear: 'N/A',
            bio: 'Amy Heckerling is an American filmmaker and actress best known for Fast Times at Ridgemont High (1982) and Look Who\'s Talking (1989).'
        },
        description: 'An American coming-of-age teen comedy about an elite high school student who befriends a new student and decides to give her a makeover while playing matchmaker to her teachers and examiing her own existence.',
        image: './img/Clueless',
        featured:'Y'
    } 
];



//MOVIE ENDPOINTS
//GET ALL movies
app.get('/movies', (req,res) =>{
    res.status(200).json(movies);
});

//GET description of movie by title
app.get('/movies/:title', (req,res) => {
    res.json(movies.find((movies) => {
        return movies.title === req.params.title
    }));
});

//GET data about a dircetor by name
app.get('/movies/:director/:name', (req,res) =>{
    res.json(movies.find((movies) => {
        return movies.director === req.params.name
    }));
});


//USER ENDPOINTS

//Parser/Handling
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