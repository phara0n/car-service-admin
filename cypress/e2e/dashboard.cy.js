describe('Dashboard', () => {
  beforeEach(() => {
    // Clear local storage before each test
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@email.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Wait for the login request to fail
    cy.contains('Invalid credentials', { timeout: 5000 });
  });

  it('should login and display dashboard', () => {
    // Intercept the login API call
    cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest');
    
    cy.get('input[type="email"]').type('superadmin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Wait for the login request to complete
    cy.wait('@loginRequest');
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
    
    // Dashboard should contain welcome message
    cy.contains('Welcome,');
    
    // Check for dashboard elements
    cy.contains('Total Cars');
    cy.contains('Cars Due for Service');
    cy.contains('Overdue Services');
    cy.contains('Due This Week');
    
    // Verify cars table exists
    cy.contains('Cars Due for Service');
    cy.get('table').should('be.visible');
  });

  it('should navigate to car prediction details page', () => {
    // Login first
    cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest');
    cy.get('input[type="email"]').type('superadmin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    // Wait for dashboard to load
    cy.url().should('include', '/dashboard');
    
    // Intercept the recent cars API call
    cy.intercept('GET', '**/api/v1/cars').as('carsRequest');
    cy.wait('@carsRequest');
    
    // Click on the first "View Predictions" button in the recent cars table
    cy.contains('Recent Cars')
      .parent()
      .find('a')
      .contains('View Predictions')
      .first()
      .click();
    
    // Should be on the car prediction page
    cy.url().should('include', '/car-predictions/');
    
    // Check for car prediction elements
    cy.contains('Service Predictions');
    cy.contains('Car Details');
    cy.contains('Upcoming Services');
    
    // Test the "Back" button
    cy.contains('Back').click();
    cy.url().should('include', '/dashboard');
  });

  it('should refresh predictions', () => {
    // Login and navigate to car prediction page
    cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest');
    cy.get('input[type="email"]').type('superadmin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    
    cy.url().should('include', '/dashboard');
    
    cy.intercept('GET', '**/api/v1/cars').as('carsRequest');
    cy.wait('@carsRequest');
    
    cy.contains('Recent Cars')
      .parent()
      .find('a')
      .contains('View Predictions')
      .first()
      .click();
    
    // Should be on the car prediction page
    cy.url().should('include', '/car-predictions/');
    
    // Intercept the refresh predictions API call
    cy.intercept('POST', '**/api/v1/service_predictions/cars/**/update').as('refreshRequest');
    
    // Click the refresh button
    cy.contains('Refresh Predictions').click();
    
    // Verify the button changes to loading state
    cy.contains('Refreshing...').should('be.disabled');
    
    // Wait for the refresh request to complete
    cy.wait('@refreshRequest');
    
    // Button should return to normal state
    cy.contains('Refresh Predictions').should('be.enabled');
  });
}); 