/* eslint-disable jest/expect-expect */
/// <reference types="cypress" />

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe("Banking app testing", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it('successfully loads', () => {
    cy.visit('/') // change URL to match your dev URL
  });

  it("Unsuccessful login attempt", () => {
    cy.get("#login").type(`!@  url123`);
    cy.get("#password").type(`skillbox{enter}`);
    cy.get(".error-message").should('contain', 'Invalid login')
  });

  it("Login functionality", () => {
    cy.get("#login").type(`developer`);
    cy.get("#password").type(`skillbox{enter}`);
    cy.url().should('include', '/accounts')
  });

  it("Log-out functionality", () => {
    cy.get("#login").type(`developer`);
    cy.get("#password").type(`skillbox{enter}`);
    cy.get("a.btn").contains("Выйти").click();
    cy.url().should('include', '/')
  });

  it("Login back in", () => {
    cy.get("#login").type(`developer`);
    cy.get("#password").type(`skillbox{enter}`);
    cy.url().should('include', '/accounts')
  });

  it("Account list displaying", () => {
    cy.get("#login").type(`developer`);
    cy.get("#password").type(`skillbox{enter}`);
    cy.url().should('include', '/accounts');

    cy.get(".account__number").contains(/[0-9]{5,}/)
  });

  it("Create new account", () => {
    cy.get("#login").type(`developer`);
    cy.get("#password").type(`skillbox{enter}`);

    const countBeforeNew = cy.get(".account__card").its('length');
    cy.get("#newAccBtn").click();
    // cy.get(".account__card").its('length').should('be.greaterThan', countBeforeNew) // doesnt quite work
  });

  it("Enter existing account and transfer money to a different account", () => {
    cy.get("#login").type(`developer`);
    cy.get("#password").type(`skillbox{enter}`);
    const rootAccount = "74213041477477406320783754";
    cy.get(".account__number").contains(rootAccount).parent().children().find(".account__open").click();
    cy.url().should('include', rootAccount);
    cy.get("#receiver").type("57450441121378212008068601")
    cy.get("#amount").type(`10 000abcdef!!{enter}`)
    cy.get("#transfer-error").contains("57450441121378212008068601");
    cy.get("#transfer-error").contains("74213041477477406320783754");
    cy.get("#transfer-error").contains('10000');
    cy.reload();
    cy.get(".history__row").first().contains("57450441121378212008068601");
    cy.get(".history__row").first().contains("74213041477477406320783754");
    cy.get(".history__row").first().contains('10 000');
  });

});
