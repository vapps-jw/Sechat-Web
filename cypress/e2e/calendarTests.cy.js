describe("chat tests", () => {
  before(() => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.get("[data-cy='sign-in']").click();

    cy.get("[data-cy='sign-in-username']").type("u1");
    cy.get("[data-cy='sign-in-password']").type("u1");
    cy.get("[data-cy='sign-in-request']").click();
  });

  it("sign out", () => {
    cy.visit("https://localhost:3000");
    cy.get("[data-cy='sign-out']").should("be.visible");
    cy.get("[data-cy='sign-out']").click();
    cy.reload();
    cy.get("[data-cy='sign-in']").should("be.visible");
  });
});
