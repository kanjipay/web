import PayeesController from "../../clientApi/v1/controllers/PayeesController"
import * as addDocument from '../../shared/utils/addDocument';
import {createRequest, createResponse} from 'node-mocks-http';
import {spy} from 'sinon';

describe("Check Client Credentials",  () => {
    test("create should 200 with correct payee details",async () => {
        const request  = createRequest({
            method: 'GET',
            url: '/my-url'
        });
        const response = await PayeesController.create(request, createResponse(), spy())
        expect(response._getStatusCode()).toBe(403);
    });

}

