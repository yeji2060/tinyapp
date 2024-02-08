const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/i3BoGr"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    return agent
      .post("/login")
      .send({ email: "a@a.com", password: "abcd" })
      .then((loginRes) => {
        // Make a GET request to a protected resource
        return agent.get("/urls/i3BoGr").then((accessRes) => {
          // Expect the status code to be 403
          expect(accessRes).to.have.status(403);

        });
      });
  });

  // Test for GET request to '/'
  it('should redirect to /login for GET request to "/" when not logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/")
      .then((res) => {
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

   // Test for GET request to '/urls/new'
  it('should redirect to /login for GET request to "/urls/new" when not logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/new")
      .then((res) => {
        expect(res).to.redirectTo("http://localhost:8080/login");
      });
  });

  // Test for GET request to '/urls/:id' when URL does not exist
  it('should show an error message for GET request to "/urls/:id" when URL does not exist', () => {
    // Assuming user is already logged in and has a valid session
    const agent = chai.request.agent("http://localhost:8080").auth('a@a.com', 'abcd');
    return agent
      .get("/urls/nonExistentId")
      .then((res) => {
        expect(res).to.have.status(404); 

      });
  });

  // Test for GET request to '/urls/:id' when not logged in
  it('should show an error message for GET request to "/urls/:id" when not logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");
    return agent
      .get("/urls/i3BoGr")
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

});