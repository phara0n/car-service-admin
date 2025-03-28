// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest');
  
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  cy.wait('@loginRequest');
  cy.url().should('include', '/dashboard');
});

// Custom command to navigate to car prediction details
Cypress.Commands.add('navigateToCarPrediction', (carIndex = 0) => {
  cy.intercept('GET', '**/api/v1/cars').as('carsRequest');
  cy.visit('/dashboard');
  cy.wait('@carsRequest');
  
  cy.contains('Recent Cars')
    .parent()
    .find('a')
    .contains('View Predictions')
    .eq(carIndex)
    .click();
  
  cy.url().should('include', '/car-predictions/');
});

// Custom command to simulate waiting for API response
Cypress.Commands.add('waitForApi', (method, urlPattern) => {
  const requestAlias = `${method.toLowerCase()}${Math.floor(Math.random() * 10000)}`;
  cy.intercept(method, urlPattern).as(requestAlias);
  return cy.wait(`@${requestAlias}`);
});

// Custom command to refresh the service predictions for a car
Cypress.Commands.add('refreshPredictions', () => {
  cy.intercept('POST', '**/api/v1/service_predictions/cars/**/update').as('refreshRequest');
  cy.contains('Refresh Predictions').click();
  cy.contains('Refreshing...').should('be.disabled');
  cy.wait('@refreshRequest');
  cy.contains('Refresh Predictions').should('be.enabled');
}); 