describe("visit Home", () => {
  it("passes", () => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
  });
});
