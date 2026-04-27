describe('UniLodge E2E', () => {
  it('should load the homepage and navigate', () => {
    cy.visit('/');
    cy.contains('UniLodge').should('be.visible');
    cy.get('button').contains('Find Room').should('exist');
  });

  it('should be able to open login modal', () => {
    cy.visit('/');
    cy.get('button').contains('Sign In').click();
    cy.contains('Welcome back').should('be.visible');
  });
});
