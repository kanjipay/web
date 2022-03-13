# Mercadopay

This is a firebse project:
    backend - firebase functions (typescript + express)
    frontend - firebase hosting (react application)

There are two projects mercadopay (production)
and mercadopay-dev (development and staging)

## setup

    brew install node
    npm install
    npm install firebase-tools -g
    firebase login

Get access to Firebase and add the relevent firebase credentials to .env.production and .env.development, as well as functions/.env files

## Frontend

### Start

In the project directory, you can run:

`npm start`

to run the app with fast reloading, it will use '.env.development' environment variables

### Build staging

run `npm build:stage`

to build the app, poin

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
This uses development API credentials. 

### `npm run build:stage`

Builds the app in the `build` folder.\

This artefact will need to be generated in order to test the app on firebase staging url

## Deploy to firebase

    npm run build:stage
    firebase deploy

make sure that the app is correct `mercado-dev`

## Lint

    npm run lint

## Deploy to production

Create a PR. Once it is merged into master, this will be deployed to production.