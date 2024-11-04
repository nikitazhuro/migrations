import * as path from 'path';
import ora from 'ora';
import { Db, MongoClient } from 'mongodb';

import { connect } from '../env/database';
import { dropChangelog, getLastAppliedMigrationFilename, getMigrationsDir, loadMigrationFile } from '../utils';

export const down = async () => {
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

  spinner.text = 'Down migration preparing';

  try {
    const lastAppliedMigration = await getLastAppliedMigrationFilename(db);
    const migrationsDir = getMigrationsDir();

    if (!lastAppliedMigration) return;

    const localSpinner = ora(`Applying migration ${lastAppliedMigration}`).start();

    try {
      const migrationPath = path.join(migrationsDir, lastAppliedMigration);
      const migration = await loadMigrationFile(migrationPath);

      const { down } = migration;

      await down(db, client);
      await dropChangelog(db, lastAppliedMigration);
      localSpinner.succeed(`Migration ${lastAppliedMigration} complete successfully`).stop();
    } catch (err) {
      localSpinner.fail(`Error executing migration ${lastAppliedMigration}`);

      client.close();
    }
  } catch (error) {
    spinner.fail('Error executing migrations');
    
    await client.close(true);
  } finally {
    await client.close(true);
  }
}