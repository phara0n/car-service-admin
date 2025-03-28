describe('Service Predictions', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should display service predictions for a specific car', () => {
    // Login as admin
    cy.login('superadmin@example.com', 'password123');
    
    // Navigate to first car's predictions
    cy.navigateToCarPrediction(0);
    
    // Verify prediction data is displayed
    cy.contains('Service Predictions');
    cy.contains('Car Details').should('be.visible');
    cy.contains('Make:').should('be.visible');
    cy.contains('Model:').should('be.visible');
    cy.contains('Year:').should('be.visible');
    cy.contains('License Plate:').should('be.visible');
    cy.contains('Current Mileage:').should('be.visible');
    
    // Verify services table
    cy.contains('Upcoming Services').should('be.visible');
    cy.get('table').should('be.visible');
    cy.contains('Service Type');
    cy.contains('Due Date');
    cy.contains('Due Mileage');
    cy.contains('Time Remaining');
    cy.contains('Miles Remaining');
  });

  it('should refresh service predictions', () => {
    // Login as admin
    cy.login('superadmin@example.com', 'password123');
    
    // Navigate to first car's predictions
    cy.navigateToCarPrediction(0);
    
    // Refresh predictions and verify
    cy.refreshPredictions();
    
    // Verify success notification appears
    cy.contains('Predictions updated successfully').should('be.visible');
  });

  it('should navigate back to dashboard from car predictions', () => {
    // Login as admin
    cy.login('superadmin@example.com', 'password123');
    
    // Navigate to first car's predictions
    cy.navigateToCarPrediction(0);
    
    // Click back button
    cy.contains('Back').click();
    
    // Verify we're on dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show cars due for service on dashboard', () => {
    // Login as admin
    cy.login('superadmin@example.com', 'password123');
    
    // Verify dashboard shows cars due for service section
    cy.contains('Cars Due for Service').should('be.visible');
    
    // Check if table has data
    cy.get('table')
      .contains('tr', 'View Predictions')
      .should('be.visible');
    
    // Check service summary cards
    cy.contains('Overdue Services').should('be.visible');
    cy.contains('Due This Week').should('be.visible');
  });
  
  it('should update mileage and recalculate predictions', () => {
    // Login as admin
    cy.login('superadmin@example.com', 'password123');
    
    // Navigate to first car's predictions
    cy.navigateToCarPrediction(0);
    
    // Intercept the update mileage API call
    cy.intercept('PUT', '**/api/v1/cars/**/update_mileage').as('updateMileage');
    
    // Open update mileage modal if there's a button
    cy.contains('Update Mileage').click();
    
    // Fill in new mileage value
    cy.get('input[type="number"]').clear().type('25000');
    
    // Submit the form
    cy.contains('button', 'Save').click();
    
    // Wait for API call to complete
    cy.wait('@updateMileage');
    
    // Verify that predictions are updated
    cy.contains('Mileage updated successfully').should('be.visible');
    
    // Verify the new mileage is displayed
    cy.contains('Current Mileage: 25,000').should('be.visible');
  });
}); 