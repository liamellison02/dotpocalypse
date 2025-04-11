# Testing Checklist for Dotcom Bubble Portfolio Simulator

This document outlines the testing procedures to ensure the application is functioning correctly before delivery.

## Functional Testing

### Authentication
- [ ] User registration works correctly
- [ ] User login works correctly
- [ ] Password reset functionality works
- [ ] User session persists on page refresh
- [ ] Logout functionality works correctly

### Stock Market Simulation
- [ ] Market initializes with correct starting values
- [ ] Stock prices update realistically when simulation advances
- [ ] Different market stages (early, growth, mania, peak, decline, crash) show appropriate behavior
- [ ] Market index chart displays correctly
- [ ] Time progression works as expected

### Portfolio Management
- [ ] User can buy stocks successfully
- [ ] User can sell stocks successfully
- [ ] Portfolio value updates correctly
- [ ] Cash balance updates correctly after transactions
- [ ] Portfolio performance charts render properly
- [ ] Sector allocation displays correctly

### AI Investment Advisor
- [ ] Advisor chat interface loads correctly
- [ ] Advisor responds to user messages
- [ ] Advisor personality matches Y2K Wall Street finance bro style
- [ ] Advisor provides contextually relevant advice based on market stage
- [ ] OpenAI integration works in production environment

### News Generation
- [ ] News headlines are generated appropriately
- [ ] News content is relevant to market stage
- [ ] Company-specific news affects corresponding stocks
- [ ] News feed displays correctly
- [ ] OpenAI integration for news generation works in production

### Save/Load Functionality
- [ ] User can save game state with a custom name
- [ ] Saved games list displays correctly
- [ ] User can load a previously saved game
- [ ] User can delete saved games
- [ ] Save/load operations are secure (users can only access their own saves)

### Dotcom Bubble Mechanics
- [ ] Bubble progresses through all stages
- [ ] Market crash occurs within the 2002-2004 timeframe
- [ ] Stocks behave realistically during crash (based on survival chance)
- [ ] Game ends appropriately after crash
- [ ] Restart functionality works correctly

### Settings
- [ ] Settings panel opens and closes correctly
- [ ] All settings options can be changed
- [ ] Settings changes apply correctly when simulation is restarted
- [ ] Settings persist between sessions

## UI Testing

### Windows 98 Theme
- [ ] All UI components match Windows 98 aesthetic
- [ ] Windows, buttons, and form elements have correct styling
- [ ] Start menu and taskbar function correctly
- [ ] Windows can be moved, resized, minimized, and closed

### Responsive Design
- [ ] Application displays correctly on desktop browsers
- [ ] Application is usable on tablet devices
- [ ] UI elements scale appropriately at different screen sizes

### Accessibility
- [ ] Text has sufficient contrast
- [ ] Interactive elements are keyboard accessible
- [ ] Screen reader compatibility for major elements

## Performance Testing

- [ ] Application loads within acceptable time
- [ ] Simulation runs smoothly at different speeds
- [ ] No memory leaks during extended use
- [ ] Charts render efficiently with large datasets
- [ ] Application remains responsive during complex operations

## Browser Compatibility

- [ ] Chrome (latest version)
- [ ] Firefox (latest version)
- [ ] Safari (latest version)
- [ ] Edge (latest version)

## Security Testing

- [ ] Authentication tokens are stored securely
- [ ] API keys are not exposed to client
- [ ] Supabase Row Level Security works correctly
- [ ] No sensitive data is logged to console
- [ ] CORS is configured correctly

## Error Handling

- [ ] Application handles network errors gracefully
- [ ] Authentication errors show appropriate messages
- [ ] API failures are handled with user-friendly messages
- [ ] Form validation works correctly
- [ ] Error boundaries catch and display UI errors

## Final Checklist

- [ ] All environment variables are configured correctly in production
- [ ] Build process completes without errors
- [ ] Application is deployed to production environment
- [ ] Documentation is complete and accurate
- [ ] Code is clean, commented, and follows best practices
- [ ] No console errors in production build

## Test Results

**Date of Testing:** _________________

**Tester:** _________________

**Environment:** _________________

**Notes:**
_________________
_________________
_________________

**Issues Found:**
_________________
_________________
_________________

**Resolution:**
_________________
_________________
_________________

**Final Approval:** ☐ Approved for delivery ☐ Needs further work
