# Mercadopay

This is a firebse project:

- backend - firebase functions (typescript express)
- frontend - firebase hosting (javascript react)


## setup

    brew install node
    npm install
    npm install firebase-tools -g
    firebase login

Get access to Firebase and add the relevent firebase credentials.

There are two projects 
- mercadopay (production)
- mercadopay-dev (development and staging)
Get access to Firebase and add the relevent firebase credentials to .env.production and .env.development, as well as functions/.env files

## Frontend

We can deploy emulated versions of both the frontend and backend locally, and to staging, to both 

<<<<<<< HEAD
### Start

`npm start`
=======
Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.
This uses development API credentials.
>>>>>>> 02f9e02d86ff5c2415ac56e92bcc5d839dc0884f

to run the app with fast reloading, it will use '.env.development' environment variables

### Build and Serve 

Run `npm build:stage` to build the app using mercadopay-dev and `npm build` to build the app using credentials for mercadopay. The assets will be in /src.

You can deploy built assets locally using `firebase serve --only hosting`

### Deploy

Deploy `firebase use [mercadopay/mercadopay-dev]`

Make sure you have run the build step before, and that the credentials match the service you are using. Please deploy to dev, submit a PR, and merge to master before deploying to production.

## backents

### Serve

In the /functions directory, you can run `npm run serve` to build the app and run locally. Run `firebase use [mercadopay/mercadopay-dev]` to switch firebase projects.

<<<<<<< HEAD
### Deploy

Run `firebase deploy --only functions`

You can deploy frontend and backend at the same time using `firebase deploy. Please deploy to dev, submit a PR, and merge to master before deploying to production.

## Lint

    npm run lint
=======
Create a PR. Once it is merged into master, this will be deployed to production.
>>>>>>> 02f9e02d86ff5c2415ac56e92bcc5d839dc0884f
