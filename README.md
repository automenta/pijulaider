# PijulAider

PijulAider is a terminal-based AI pair programming tool designed to streamline your workflow with LLM-driven code editing, feature generation, bug fixing, and change management. It supports Git, Pijul, and a simple file-based versioning system.

## Features

- **LLM-driven code editing:**  Leverage the power of language models to generate code, fix bugs, and refactor your codebase.
- **Seamless version control:**  PijulAider integrates with Git and Pijul, allowing you to easily track changes and manage your repository.
- **Extensible command system:**  PijulAider comes with a set of built-in commands, and you can easily add your own to extend its functionality.
- **Terminal-based UI:** The user-friendly terminal interface provides a smooth and efficient user experience.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/automenta/pijulaider.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the tool:
    ```bash
    ./src/index.js
    ```

## Usage

PijulAider supports a variety of commands to help you with your coding tasks. Here are a few examples:

-   `/add <file>`: Add a file to the chat so the LLM can see it.
-   `/diff`: Show the current changes.
-   `/record <message>`: Record the current changes with a message.
-   `/help`: Show a list of available commands.

For a full list of commands, use the `/help` command within the tool.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
