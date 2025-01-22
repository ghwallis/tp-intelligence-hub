# Contributing to Transfer Pricing Intelligence Platform

We love your input! We want to make contributing to the Transfer Pricing Intelligence Platform as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github
We use Github to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)
Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Process

### Setting Up Development Environment
1. Ensure you have Node.js 18+ installed
2. Clone the repository: `git clone https://github.com/your-org/transfer-pricing-hub`
3. Install dependencies: `npm install`
4. Set up environment variables (see below)
5. Start development server: `npm run dev`

### Environment Variables Required
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
AWS_REGION=...
DOCDB_CLUSTER_ENDPOINT=...
DOCDB_USERNAME=...
DOCDB_PASSWORD=...
```

### Code Structure
```
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
├── db/                     # Database models and migrations
│   ├── docdb/            # DocumentDB configuration
│   └── schema.ts         # Drizzle schema definitions
├── server/                 # Backend Express application
│   ├── routes.ts         # API routes
│   └── vite.ts           # Vite configuration
```

### Development Guidelines

#### Frontend
- Use TypeScript for all new code
- Follow React hooks best practices
- Implement responsive design using Tailwind CSS
- Use shadcn/ui components for consistent UI
- Implement proper error handling and loading states
- Write meaningful test cases

#### Backend
- Follow RESTful API design principles
- Use proper error handling middleware
- Implement input validation using Zod
- Write comprehensive API documentation
- Maintain security best practices
- Follow clean code principles

#### Database
- Use Drizzle ORM for database operations
- Write clear and maintainable schemas
- Follow naming conventions
- Document all schema changes
- Create proper indexes for performance

### Code Style Guidelines
- Use ESLint and Prettier for code formatting
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript types effectively

### Testing
- Write unit tests for all new features
- Test edge cases and error scenarios
- Run the full test suite before submitting PR
- Include both frontend and backend tests
- Write integration tests for critical flows

### Documentation
- Update README.md for major changes
- Document all new features
- Include JSDoc comments for functions
- Update API documentation
- Add comments for complex logic

### Git Commit Guidelines
Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code changes (no features/fixes)
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build process or tools

### Pull Request Process
1. Update documentation
2. Update the changelog
3. Get review from maintainers
4. Address review comments
5. Update based on feedback
6. Get final approval
7. Merge to main branch

## License
By contributing, you agree that your contributions will be licensed under its MIT License.

## Questions?
Feel free to open an issue for discussion or contact the maintainers directly.

## Code of Conduct
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Maintain professionalism
- Follow project guidelines

This contributing guide was inspired by the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md).