# Contributing to Signalist

Thank you for your interest in contributing to Signalist! We welcome contributions from the community to help make this platform even better.

## Getting Started

1. **Fork the repository** to your own GitHub account.
2. **Clone your fork** to your local machine.
   ```bash
   git clone https://github.com/YOUR_USERNAME/TheWheel.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

- **Code Style**: We use ESLint and Prettier to maintain code quality. Please ensure your code follows the project's style.
- **Types**: Always use TypeScript and define types in `types/global.d.ts` for global structures.
- **Components**: Use Shadcn/UI components located in `components/ui` whenever possible.
- **State Management**: Use React hooks and Server Actions for data fetching and mutations.
- **Background Jobs**: New background processes should be implemented as Inngest functions in `lib/inngest`.

## Submitting Changes

1. **Commit your changes** with a descriptive message.
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Open a Pull Request** against the `main` branch of the original repository.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on the GitHub repository. Provide as much detail as possible, including steps to reproduce for bugs.

---

Happy coding!
