describe("chat tests", () => {
  beforeEach(() => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.get("[data-cy='sign-in']").click();

    cy.get("[data-cy='sign-in-username']").type("u1");
    cy.get("[data-cy='sign-in-password']").type("u1");
    cy.get("[data-cy='sign-in-request']").click();
  });

  it("room test", () => {
    cy.get("[data-cy='rooms-bottom-nav']").click();
    cy.get("[data-cy='create-room-dialog-btn']").click();
    cy.get("[data-cy='new-room-name-field']").type("test-room-1");
    cy.get("[data-cy='create-room-btn']").click();
    cy.contains("test-room-1").should("be.visible");

    cy.contains("test-room-1").click();
    cy.get("[data-cy='messages-test-editor-container']").should("be.visible");

    for (let index = 0; index < 10; index++) {
      cy.get("[data-cy='editor-content']").type(`test-message-${index}`);
      cy.get("[data-cy='push-message-btn']").click();
      cy.contains(`test-message-${index}`).should("be.visible");
    }

    cy.get("[data-cy='rooms-bottom-nav']").click();
    cy.get("[data-cy='room-options-btn']").click();
    cy.contains("Delete").click();
    cy.contains("Yes").click();
    cy.contains("test-room-1").should("not.be.visible");
  });
});
