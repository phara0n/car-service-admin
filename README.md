# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Running the Application

The frontend application runs on port 3001 by default to avoid conflicts with the backend API (which runs on port 3000).

### Starting the App

```bash
# Standard method
npm start

# OR using the start script
./src/start.sh
```

The application will be available at http://localhost:3001

### Port Configuration

The port is configured in several places:

1. In the `.env` file with `PORT=3001`
2. In the `package.json` start script with `PORT=3001 react-scripts start`
3. In the `src/start.sh` script

If you need to change the port, make sure to update all of these locations and also update the Cypress configuration in `cypress.config.js`.

### API Configuration

The backend API URL is configured to point to `http://localhost:3000/api/v1` in:

1. The `.env` file as `REACT_APP_API_URL`
2. The runtime configuration at `public/config/config.json`

## Testing

### Unit Tests

The application comes with comprehensive unit tests for components and features. To run the unit tests:

```bash
npm test
```

Unit tests are written using Jest and React Testing Library, focusing on component behavior and Redux interactions.

### End-to-End Tests

We use Cypress for end-to-end testing. To run the e2e tests:

```bash
# Run tests in headless mode
npm run test:e2e

# Open Cypress UI for interactive testing
npm run cypress:open
```

Our end-to-end tests cover key user flows including:
- Login and authentication
- Dashboard navigation and views
- Service prediction functionality
- Car management operations

### Test Structure

```
admin-user-app/
├── src/
│   └── __tests__/            # Unit tests using Jest
│       ├── components/
│       ├── pages/
│       └── slices/
└── cypress/
    ├── e2e/                  # Cypress E2E tests
    │   ├── dashboard.cy.js
    │   └── service-predictions.cy.js
    └── support/              # Cypress support files
        └── commands.js       # Custom Cypress commands
```

### Writing Tests

#### Unit Tests

Unit tests focus on individual components and their behavior:
- Component rendering
- User interactions
- State management
- Error handling

#### E2E Tests

E2E tests simulate real user flows through the application:
- Authentication and authorization
- Navigation between pages
- Form submissions
- API interactions
- UI responsiveness

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
