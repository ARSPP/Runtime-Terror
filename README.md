# GroupProject_375

## Steps to Run

1. Utilize env_sample.json instead of env.json
    - Change line 3 in restaurant.js to `let env = require("../env_sample.json");`
    - Change line 6 in login.js to `let env = require("../env_sample.json");`
2. Update env_sample.json to have the correct key-value pairs
    - Set `foursquareApiKey` to be the key to Foursquare Places API
    - Set `user` to your postgres user
    - set `password` to your postgres password
3. Install dependencies
    - `npm i`
4. Setup the database
    - `npm run setup`
5. Start the server
    - `npm run start`