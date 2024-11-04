import { program } from 'commander';

import { create } from '../actions/create';

require('dotenv').config()

program
  .description('Create a new migration file under migrations directory')
  .action((_, options) => {
    const { args = [] } = options;

    const description = args[0];

    if (description) {
      create(description)
    }
  });

program.parse();