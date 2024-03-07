# Movie API 

## Description
This is a server-side application for a movies web application. Users who may want to search for information on directors, genres or specific movie titles can do so. 

## Features
The functionality of this movie API will facilitate, amongst other things, enable:
 - new users to register an account and log in
 - update user profile information, e.g. new password or username
 - add and remove movies from a favorites list
 - delete your user account

## Project dependencies
- Node.js 
- Express
- morgan
- mongoose
- uuid
- body-parser
- passport-jwt
 
 ## Endpoints 
The available endpoints for this API are listed below: 
- Create a new user: `/users`
- Search a single user: `users/[userName]`
- Get all movies: `/movies`
- Get a specific movie: `/movie/[title]/`
- Get a genre: `/movies/genre/[genreName]`
- Get info on a director: `movies/directors/[directorName]`
- Update user info: `users/[userName]`
- Add/Remove from favorites: `users/[userName]//movie/[title]/`
- Delete user: `users/[userName]`



