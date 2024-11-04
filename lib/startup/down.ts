import { Command } from 'commander';
import dotenv from 'dotenv';

import { down } from '../actions/down';

dotenv.config();

const program = new Command();

program
  .description('Undo migrations')
  .action(async () => {
    try {
      await down();
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });

program.parse();

