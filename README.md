# PackForCamp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push to trigger deployment:**
   - The workflow will automatically run when you push to the `main` or `master` branch
   - You can also manually trigger it from the Actions tab using "workflow_dispatch"

3. **Your site will be available at:**
   - `https://[your-username].github.io/chckd/`

### Manual Deployment

If you want to deploy manually, you can use:

```bash
pnpm run deploy
```

This will build the project and prepare the necessary files (404.html and .nojekyll) for GitHub Pages.

### Important Notes

- The project is configured with `baseHref: "/chckd/"` for GitHub Pages subdirectory deployment
- A `404.html` file is automatically created to support Angular routing on GitHub Pages
- A `.nojekyll` file is created to prevent Jekyll from processing the site

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
