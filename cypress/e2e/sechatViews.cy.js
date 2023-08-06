describe("access actions", () => {
  beforeEach(() => {
    cy.visit("https://localhost:3000");
    cy.contains("I Accept Cookies").click();
    cy.contains("Sign In").click();

    cy.get("#sign-in-username").type("u1");
    cy.get("#sign-in-password").type("u1");
    cy.get("#sign-in-button").click();
  });

  it("check messages nav button", () => {
    cy.getByTestId("messages-bottom-nav").should("be.visible");
  });

  it("check apps nav button", () => {
    cy.getByTestId("apps-bottom-nav").should("be.visible");
  });

  it("check rooms nav button", () => {
    cy.getByTestId("rooms-bottom-nav").should("be.visible");
  });
});
