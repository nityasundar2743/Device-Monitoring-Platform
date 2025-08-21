# Contributing to Device Monitoring Platform

Thank you for your interest in contributing to the Device Monitoring Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ for frontend development
- Python 3.9+ for backend development
- Docker and Docker Compose for containerization
- Git for version control

### Development Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/your-username/Device-Monitoring-Platform.git
   cd Device-Monitoring-Platform
   ```

2. **Set Up Development Environment**
   ```bash
   # Start services with hot reload
   docker compose -f docker-compose.dev.yml up -d
   
   # Or set up manually for each service
   # See individual service READMEs for detailed setup
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Code Style and Standards

### General Guidelines

- **Write clear, self-documenting code**
- **Add comments for complex logic**
- **Follow existing code patterns and conventions**
- **Write tests for new features**
- **Update documentation as needed**

### Frontend (Dashboard)

- **TypeScript:** Use strict typing, avoid `any`
- **React:** Follow React best practices and hooks patterns
- **Styling:** Use Tailwind CSS classes, follow component patterns
- **Components:** Create reusable, well-documented components

```tsx
// Example component structure
interface ComponentProps {
  title: string
  data?: DataType[]
}

export function Component({ title, data }: ComponentProps) {
  // Component implementation
  return (
    <div className="component-container">
      {/* JSX content */}
    </div>
  )
}
```

### Backend (Server)

- **Python:** Follow PEP 8 style guide
- **FastAPI:** Use proper type hints and response models
- **Database:** Use SQLModel for database operations
- **Error Handling:** Implement proper error handling and logging

```python
# Example endpoint structure
@app.post("/api/endpoint")
async def endpoint_function(
    data: RequestModel,
    session: Session = Depends(get_session)
) -> ResponseModel:
    """
    Endpoint description.
    """
    try:
        # Implementation
        return ResponseModel(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Client (Monitoring Agent)

- **Python:** Follow PEP 8 style guide
- **Cross-platform:** Ensure compatibility across operating systems
- **Error Handling:** Graceful handling of system monitoring failures
- **Configuration:** Use environment variables for configuration

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd dashboard
npm test

# Backend tests
cd Server
pytest

# Integration tests
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Writing Tests

- **Unit Tests:** Test individual functions and components
- **Integration Tests:** Test API endpoints and database interactions
- **E2E Tests:** Test complete user workflows

### Test Guidelines

- Write tests for new features and bug fixes
- Maintain good test coverage
- Use descriptive test names
- Mock external dependencies

## 📚 Documentation

### README Updates

- Update relevant README files when adding features
- Include code examples and usage instructions
- Keep documentation up to date with code changes

### Code Documentation

- Add JSDoc comments for complex functions
- Document API endpoints with proper descriptions
- Include type definitions and examples

### Changelog

- Add entries to CHANGELOG.md for significant changes
- Follow the format: `[Added/Changed/Fixed/Removed]`
- Include breaking changes in a separate section

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your code follows the style guidelines**
2. **Write or update tests as needed**
3. **Update documentation**
4. **Test your changes thoroughly**
5. **Rebase on the latest main branch**

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added/updated tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by maintainers
3. **Testing** on different environments
4. **Approval** and merge

## 🐛 Bug Reports

### Before Reporting

- Check existing issues to avoid duplicates
- Test with the latest version
- Try to reproduce the issue consistently

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What you expected to happen

**Environment:**
- OS: [e.g. Windows 10, Ubuntu 20.04]
- Browser: [e.g. Chrome 96, Firefox 95]
- Version: [e.g. v1.0.0]

**Additional context**
Any other context about the problem
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of the desired feature

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or other context
```

## 🏷️ Issue Labels

- **bug:** Something isn't working
- **enhancement:** New feature or request
- **documentation:** Improvements or additions to documentation
- **good first issue:** Good for newcomers
- **help wanted:** Extra attention is needed
- **priority:high:** High priority issue
- **priority:low:** Low priority issue

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's code of conduct

### Communication

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** General questions and discussions
- **Pull Requests:** Code changes and reviews

## 📋 Development Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/code-improvement` - Code refactoring

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(dashboard): add device filtering`
- `fix(server): resolve database connection issue`
- `docs(readme): update installation instructions`

### Release Process

1. **Version bump** following semantic versioning
2. **Update CHANGELOG.md**
3. **Create release tag**
4. **Build and test release**
5. **Deploy to production**

## 🛠️ Development Tips

### Debugging

- Use browser developer tools for frontend debugging
- Use IDE debuggers for backend development
- Check Docker logs for containerization issues
- Use logging extensively for troubleshooting

### Performance

- Monitor bundle sizes for frontend
- Profile database queries for backend
- Use appropriate caching strategies
- Optimize Docker images for size and speed

### Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user inputs
- Follow security best practices

## 📞 Getting Help

- **Documentation:** Check README files and inline comments
- **Issues:** Search existing issues or create a new one
- **Discussions:** Use GitHub Discussions for questions
- **Code Review:** Request reviews from maintainers

Thank you for contributing to the Device Monitoring Platform! 🎉