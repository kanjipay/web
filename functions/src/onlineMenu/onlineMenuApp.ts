import * as express from "express";

const main = express();

main.use(express.json());
main.use(express.urlencoded({ extended: true }));

export default main;