import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';
import { Db, MongoClient } from 'mongodb';

import { connect } from '../env/database';
import { checkIfMigrationApplied, getMigrationsDir, getMigrationsFileNames, updateChangelog } from '../utils';

interface MigrationObject {
  up(db: Db, client: MongoClient): Promise<void | never>;
  down(db: Db, client: MongoClient): Promise<void | never>;
}

const loadMigrationFile = async (
  filePath: string
): Promise<MigrationObject> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filePath} not exists.`);
  }

  return (await import(path.resolve(filePath))).default;
};

export const run = async () => {
  let client: MongoClient;
  let db: Db;
  const spinner = ora('Connecting to MongoDb').start();

  try {
    const connection = await connect();
    
    client = connection.client;
    db = connection.db;
  } catch (error) {
    spinner.fail(`Error while mongo connection`);
    throw new Error('Error while mongo connection');
  }

  spinner.text = 'Migrations preparing';

  try {
    const allMigrationsFiles = getMigrationsFileNames();
    const migrationsFiles = await checkIfMigrationApplied(db, allMigrationsFiles);

    const migrationsDir = getMigrationsDir();

    const migrateItem = async (fileName: string) => {
      try {
        const migrationPath = path.join(migrationsDir, fileName);
        const migration = await loadMigrationFile(migrationPath);

        const { up, down } = migration;

        await up(db, client);

        const changelogData = {
          createdAt: new Date(),
          fileName,
          status: 'APPLIED',
        }

        await updateChangelog(db, changelogData);
  
      } catch (err) {
        const changelogData = {
          createdAt: new Date(),
          fileName,
          status: 'ERROR',
        }

        await updateChangelog(db, changelogData);

        client.close();
      }
    };

    for await (const migrationName of migrationsFiles) {
      if (!migrationName) return;

      const localSpinner = ora(`Applying migration ${migrationName}`).start();

      try {
        const localSpinner = ora(`Applying migration ${migrationName}`).start();
  
        await migrateItem(migrationName);
  
        localSpinner.succeed(`Migration ${migrationName} complete successfully`).stop();
        } catch (e) {
        localSpinner.fail(`Error executing migration ${migrationName}`);
        throw new Error(`Error while migration ${migrationName}`);
      }
    }
    spinner.succeed(`${migrationsFiles.length} migrations complete successfully`).stop();
  } catch (error) {
    spinner.fail('Error executing migrations');
    
    await client.close(true);
  } finally {
    await client.close(true);
  }
}