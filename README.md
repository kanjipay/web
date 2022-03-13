# Mercadopay

This app's frontend and backend code are deployed using Google Firebase.

Frontend - react
Backent - firebase functions (typescript)

## setup app

Get access to the firebase project first, and then run the following

    brew install node
    npm install
    npm install firebase-tools -g
    firebase login

There are also some credentials to be added to .env.production and .env.development

## setup functions

    cd functions
    npm install

## Scripts - frontent

### run locally `npm start`

Runs the app in the development mode. 
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

Make sure that the backend-url and the frontend credentials in .env.development are the same app! 

### Deploy frontend to firebase

    firebase use mercadopay
    firebase deploy --only hosting

## Scripts - backend

### run locally `cd frontend && npm serve`

Runs emulated firebase functions on http://localhost:5001


### Deploy backend to firebase

    firebase use mercadopay
    firebase deploy --only functions

Make sure that the backend-url and the frontend credentials in .env.development are the same app!

## Deploy both backend and frontend

### Deploy backend to firebase

    firebase use mercadopay
    firebase deploy --only functions

Make sure that the backend-url and the frontend credentials in .env.development are the same app!

### Deploy backend to firebase

    firebase use mercadopay
    firebase deploy

Make sure that the backend-url and the frontend credentials in .env.development are the same app!

## Lint

    npm run lint

### Todo

- Add backend tests
- Add single frontend ingegration test
- Staging prod apps. 
- Automated CI/CD for prod-deploys
- security hardening