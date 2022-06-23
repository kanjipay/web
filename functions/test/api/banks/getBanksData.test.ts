import { api, expect } from "../../utils/server";

describe("Get Banks Data", () => {
  it("Should get valid banks data for GB", (done) => {
    api
      .get('/banks/GB')
      .end(function(err, res) {
        expect(res).to.have.status(200);
        done();                              
      });
   
  });
  it("Should get valid banks data for IE", (done) => {
    api
    .get('/banks/IE')
    .end(function(err, res) {
      expect(res).to.have.status(200);
      done();                               
    });
  
  });
  it("Should fail for ZZ", (done) => {
    api
    .get('/banks/ZZ')
    .end(function(err, res) {
      expect(res).to.have.status(500);
      done();                             
    });
  });

});
