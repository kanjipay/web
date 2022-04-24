import { checkClientCredentials} from '../clientApi/shared/authenticateClient';
import * as fetchDocument from '../shared/utils/fetchDocument';
import * as createHash from '../shared/utils/createHash';
import {createRequest, createResponse} from 'node-mocks-http';
import {spy} from 'sinon';

const noMatchPromise = new Promise((resolve, reject) => {
  resolve({});
});

const MatchPromise = new Promise((resolve, reject) => {
  resolve({'client':{'clientSecretHash':'myHashValue'}});
});

function nextFn() {
  return 'next function response'
}


describe("Check Client Credentials",  () => {
    test("it should 403 with no client credentials",async () => {
        const request  = createRequest({
            method: 'GET',
            url: '/my-url'
        });
        const response = await checkClientCredentials(request, createResponse(), spy())
        expect(response._getStatusCode()).toBe(403);
    });
    test("it should fail with wrong clientId",async () => {
      const spyFecth = jest.spyOn(fetchDocument,'fetchDocument');
      spyFecth.mockReturnValue(noMatchPromise);
      const request  = createRequest({
          method: 'GET',
          url: '/my-url',
          headers: {
            "mcp-client-id":'my-client-id'
          }
      });

      const response = await checkClientCredentials(request, createResponse(), spy())
      expect(response._getStatusCode()).toBe(403);
    });
    test("it should Fail without matching client secret",async () => {
      const spyFetch = jest.spyOn(fetchDocument,'fetchDocument');
      spyFetch.mockReturnValue(MatchPromise);
      const spyHash = jest.spyOn(createHash,'generateHash');
      spyHash.mockReturnValue("wrongHashValue");
      const request  = createRequest({
          method: 'GET',
          url: '/my-url',
          headers: {
            "mcp-client-id":'my-client-id',
            "mcp-client-secret":"my-secret"
          }
      });

      const response = await checkClientCredentials(request, createResponse(), spy())
      expect(response._getStatusCode()).toBe(403);
    });
    test("it should call next fn. with matching client secret",async () => {
      const spyFetch = jest.spyOn(fetchDocument,'fetchDocument');
      spyFetch.mockReturnValue(MatchPromise);
      const spyHash = jest.spyOn(createHash,'generateHash');
      spyHash.mockReturnValue("myHashValue");
      const request  = createRequest({
          method: 'GET',
          url: '/my-url',
          headers: {
            "mcp-client-id":'my-client-id',
            "mcp-client-secret":"my-secret"
          }
      });

      const nextVal = await checkClientCredentials(request, createResponse(), nextFn)
      expect(nextVal).toBe('next function response');
    });
  });