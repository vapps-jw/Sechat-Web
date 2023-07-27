describe("visit pages", () => {
  it("visit About", () => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.contains("About").click();
  });
  it("visit Home", () => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
  });
  it("visit Sign In", () => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.contains("Sign In").click();
  });
});
