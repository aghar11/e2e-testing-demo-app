# Web Application E2E Testing App POC

This app is a proof of concept web application for end-to-end UI testing using Playwright and React Flow. The app enables users to design and execute modular, codeless test cases by visually chaining together test steps using a drag-and-drop interface. Each test case can represent specific actions, such as opening a webpage or performing a search.

## Features

- **Modular Test Cases**: Predefined test steps (e.g., opening Google, searching "NHL") can be easily combined into complex test flows.
- **Drag-and-Drop:** Interface: Users can drag individual test steps from a sidebar and arrange them in the order they wish to execute.
- **Visual Test Flow:** React Flow is used to provide a visual representation of the test steps and their connections, allowing users to design test flows intuitively.
- **Execution of Test Cases:** Once a test flow is designed, users can click a button to run the entire sequence of test steps, automating UI interactions using Playwright.
- **Dynamic Test Chains:** The app allows users to swap and customize individual test steps to build new test chains without any coding.

## Usage/Examples

1. **Create Test Flow:** Users select predefined test cases like "Open Google" or "Search NHL" from a sidebar.
2. **Drag and Chain:** The user drags the steps into a canvas area, chaining them together as needed.
3. **Run Test:** The user presses the "Run Test" button, triggering the automated execution of the chained test cases through Playwright.
4. **Clear Workspace:** The user presses the "Clear" button to remove all nodes and edges from the workspace

https://github.com/user-attachments/assets/4c8d5ed8-3a70-4173-920e-f5812f98ff18

## Tech Stack

**Frontend:** React.js, React Flow (for creating and visualizing test flows)

**Backend:** Node.js, Express (to handle Playwright test execution)

**Testing:** Playwright (for automated browser interactions)

## Deployment
**Pre-Requisites**

Must have [Docker](https://www.docker.com/get-started/) installed and running

Can verify Node is installed and running by:
```bash
docker info
```

**Building the Application**
```bash
docker-compose up --build
```
Backend server will be listening at http://localhost:8000

UI will be accessible at http://localhost:3000/

## Authors

[Akarsh Gharge | @aghar11](https://github.com/aghar11)

## 🔗 Links

[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://akarsh.ca/)

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/akarsh-gharge-5881541b6/)

## Badges
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
