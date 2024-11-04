import { program } from 'commander';
import dotenv from 'dotenv';

import { run } from '../actions/run';

dotenv.config();

program
  .description('Run all pending migrations')
  .action(async () => {
    try {
      await run();
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });

program.parse();