import { program } from 'commander';
import dotenv from 'dotenv';
import Table from 'cli-table3';

import { status } from '../actions/status';
import { IChangelog } from '../types';

dotenv.config();

async function printStatusTable(changelog: any) {
  const table = new Table({ head: ['Filename', 'Applied at', 'Status'] });

  changelog.forEach((item: any) => {
    const { fileName, createdAt, status } = item;

    table.push([fileName, createdAt?.toJSON(), status] as any);

  });
  console.log(table.toString());
}

program
  .description('Run all pending migrations')
  .action(async () => {
    try {
      const data = await status();

      printStatusTable(data)
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    } finally {
      process.exit();
    }
  });

program.parse();