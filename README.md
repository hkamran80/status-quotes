# Status Quotes
A simple site to help me keep track of what status I'm currently using for Discord

This site requires an account on [HarperDB Cloud](https://harperdb.io/product/harperdb-cloud/) and [Auth0](https://auth0.com/).

## Environment Variables
- `VITE_AUTH0_DOMAIN`: Your Auth0 domain
- `VITE_AUTH0_CLIENT_ID`: Your Auth0 client ID (app)
- `VITE_ADMIN_USERS`: A list of Auth0 identifiers (the `sub` attribute), separated by commas
  - These users are the only ones with access to set the current status
  - Others can still add
- `VITE_HARPERDB_HOST`: The domain of your HarperDB instance
- `VITE_HARPERDB_TOKEN`: Your HarperDB token for HTTP Basic Authentication (`username:password`)
- `VITE_HARPERDB_SCHEMA`: The name of your HarperDB schema
  - Note: You will need to manually create the schema
- `VITE_HARPERDB_TABLE`: The name of your HarperDB table that will contain the quotes
  - Note: You will need to manually create the table