#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const ora = require('ora');
const axios = require('axios');
const path = require('path');

const BACKEND_URL = process.env.COPILOT_BACKEND_URL || 'http://localhost:3000';

program.version('1.0.0').description('AI Copilot CLI - Local AI coding assistant');

program
  .command('complete')
  .description('Complete code snippet')
  .option('-f, --file <path>', 'Read code from file')
  .action(async (options) => {
    let code = '';

    if (options.file) {
      code = await fs.readFile(options.file, 'utf-8');
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'code',
          message: 'Paste your code (will open in editor):',
        },
      ]);
      code = answers.code;
    }

    const language = await inquirer.prompt([
      {
        type: 'list',
        name: 'lang',
        message: 'Select language:',
        choices: ['javascript', 'python', 'java', 'cpp', 'go', 'rust'],
        default: 'javascript',
      },
    ]);

    const spinner = ora('Generating completion...').start();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/complete`, {
        code,
        language: language.lang,
      });

      spinner.succeed('Completion generated!');
      console.log(chalk.blue('\n--- Completion ---'));
      console.log(response.data.completion);
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

program
  .command('explain')
  .description('Explain code')
  .option('-f, --file <path>', 'Read code from file')
  .action(async (options) => {
    let code = '';

    if (options.file) {
      code = await fs.readFile(options.file, 'utf-8');
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'code',
          message: 'Paste your code:',
        },
      ]);
      code = answers.code;
    }

    const spinner = ora('Generating explanation...').start();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/explain`, {
        code,
      });

      spinner.succeed('Explanation generated!');
      console.log(chalk.green('\n--- Explanation ---'));
      console.log(response.data.explanation);
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

program
  .command('fix')
  .description('Find and fix bugs')
  .option('-f, --file <path>', 'Read code from file')
  .action(async (options) => {
    let code = '';

    if (options.file) {
      code = await fs.readFile(options.file, 'utf-8');
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'code',
          message: 'Paste your code:',
        },
      ]);
      code = answers.code;
    }

    const description = await inquirer.prompt([
      {
        type: 'input',
        name: 'desc',
        message: 'Describe the issue (optional):',
      },
    ]);

    const spinner = ora('Analyzing code...').start();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/fix`, {
        code,
        description: description.desc,
      });

      spinner.succeed('Analysis complete!');
      console.log(chalk.yellow('\n--- Fix Suggestion ---'));
      console.log(response.data.suggestion);
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

program
  .command('test')
  .description('Generate tests')
  .option('-f, --file <path>', 'Read code from file')
  .action(async (options) => {
    let code = '';

    if (options.file) {
      code = await fs.readFile(options.file, 'utf-8');
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'code',
          message: 'Paste your code:',
        },
      ]);
      code = answers.code;
    }

    const framework = await inquirer.prompt([
      {
        type: 'list',
        name: 'fw',
        message: 'Select test framework:',
        choices: ['jest', 'mocha', 'unittest', 'pytest'],
      },
    ]);

    const spinner = ora('Generating tests...').start();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/test`, {
        code,
        framework: framework.fw,
      });

      spinner.succeed('Tests generated!');
      console.log(chalk.cyan('\n--- Generated Tests ---'));
      console.log(response.data.test);
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

program
  .command('docs')
  .description('Generate documentation')
  .option('-f, --file <path>', 'Read code from file')
  .action(async (options) => {
    let code = '';

    if (options.file) {
      code = await fs.readFile(options.file, 'utf-8');
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'code',
          message: 'Paste your code:',
        },
      ]);
      code = answers.code;
    }

    const style = await inquirer.prompt([
      {
        type: 'list',
        name: 'st',
        message: 'Select documentation style:',
        choices: ['jsdoc', 'sphinx', 'javadoc'],
      },
    ]);

    const spinner = ora('Generating documentation...').start();

    try {
      const response = await axios.post(`${BACKEND_URL}/api/docs`, {
        code,
        style: style.st,
      });

      spinner.succeed('Documentation generated!');
      console.log(chalk.magenta('\n--- Documentation ---'));
      console.log(response.data.documentation);
    } catch (error) {
      spinner.fail(`Error: ${error.message}`);
    }
  });

program
  .command('health')
  .description('Check backend health')
  .action(async () => {
    const spinner = ora('Checking backend...').start();

    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      spinner.succeed('Backend is online!');
      console.log(chalk.green(`\n✅ Status: ${response.data.status}`));
      console.log(`🤖 Model: ${response.data.ollama.activeModel}`);
      console.log(`📍 URL: ${response.data.ollama.baseUrl}`);
    } catch (error) {
      spinner.fail('Backend is offline');
      console.log(chalk.red(`\n❌ Make sure the backend is running: npm start`));
      console.log(chalk.yellow(`Expected at: ${BACKEND_URL}`));
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
