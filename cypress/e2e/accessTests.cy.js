describe("access actions", () => {
  beforeEach(() => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.get("[data-cy='sign-in']").click();

    cy.get("[data-cy='sign-in-username']").type("u1");
    cy.get("[data-cy='sign-in-password']").type("u1");
    cy.get("[data-cy='sign-in-request']").click();
  });

  it("sign in", () => {
    cy.go("back");
    cy.get("[data-cy='sign-in']").should("not.be.visible");
  });

  it("sign out", () => {
    cy.get("[data-cy='sign-out']").should("be.visible");
    cy.get("[data-cy='sign-out']").click();
    cy.reload();
    cy.get("[data-cy='sign-in']").should("be.visible");
  });
});
