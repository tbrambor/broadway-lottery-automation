# Acknowledgments

This project was originally forked from [NameFILIP/broadway-lottery](https://github.com/NameFILIP/broadway-lottery), which provided the initial foundation for Broadway Direct lottery automation.

## Original Project

The original project by [NameFILIP](https://github.com/NameFILIP) introduced:

- Basic Broadway Direct lottery automation using Playwright
- GitHub Actions integration for automated entries
- Initial project structure and setup

## This Project

This version has been substantially rewritten and expanded with:

### Major Enhancements

- **Multi-lottery Support**: Added complete Telecharge lottery automation alongside Broadway Direct
- **Auto-discovery**: Automatic show discovery from bwayrush.com for both platforms
- **Interactive Configuration**: User-friendly command-line tools for configuring shows
- **Enhanced Modularity**: Improved code structure, separation of concerns, and maintainability
- **Better Documentation**: Comprehensive guides for non-technical users
- **Show Management**: JSON-based configuration with preference preservation
- **Unified Tech Stack**: Converted Telecharge from Python/Selenium to TypeScript/Playwright for consistency

### Technical Improvements

- TypeScript/Playwright implementation for both lotteries
- Modular architecture with shared utilities
- Environment variable validation and error handling
- Improved error messages and logging
- Better test structure and organization
- Makefile targets for common operations

While the original project provided valuable inspiration and a starting point, this version represents a significant evolution with expanded functionality and improved user experience.
