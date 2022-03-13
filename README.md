# Kanjipay

## setup

    brew install node
    npm install
    npm install firebase-tools -g
    firebase login

Get access to Firebase and add the relevent firebase credentials to .env.production and .env.development

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.
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
