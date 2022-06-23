require('dotenv').config();
import * as chai from "chai"
import chaiHttp = require("chai-http")

chai.use(chaiHttp)

export const expect = chai.expect
export const main = chai.request(process.env.BASE_SERVER_URL + "/main")
export const webhooks = chai.request(process.env.BASE_SERVER_URL + "/main/webhooks/v1")
export const api = chai.request(process.env.BASE_SERVER_URL + "/main/api/v1")