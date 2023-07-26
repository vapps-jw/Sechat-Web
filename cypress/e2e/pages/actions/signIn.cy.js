describe("sign in", () => {
  it("passes", () => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.contains("Sign In").click();

    cy.get("#sign-in-username").type("u1");
    cy.get("#sign-in-password").type("u1");
    cy.get("#sign-in-button").click();
  });
});
