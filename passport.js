const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy, //This variable defines basic HTTP requests for login requests
    Models = require('./models.js'), //Username checked within the database to verify user exists; password verified using bcrypt
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy, //Enables authentication of users based on JWT submitted with requests
    ExtractJWT = passportJWT.ExtractJwt; //JWT is extracted from the header of HTTP request

passport.use(
    new LocalStrategy(
        { usernameField: 'Username', passwordField: 'Password' },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({ Username: username })
                .then((user) => {
                    if (!user) {
                        console.log('Incorrect username');
                        return callback(null, false, {
                            message: 'Incorrect username or password.',
                        });
                    if (!user.validatePassword(password)) {
                        console.log('Incorrect password');
                        return callback(null, false, {
                            message: 'Incorrect password.'
                        });
                    }
                    }
                    console.log('Finished');
                    return callback(null, user);
                })
                .catch((error) => {
                    if (error) {
                        console.error(error);
                        return callback(error);
                    }
                })
        }
    )
);

passport.use(new JWTStrategy (
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_secret'
    }, async (jwtPayload, callback) => {
        return await Users.findById(jwtPayload._id)
            .then((user) => {
                return callback(null, user);
            })
            .catch((error) => {
                return callback(error)
            });
    }));

