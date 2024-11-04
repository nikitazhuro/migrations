import { Db } from 'mongodb';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface IChangelogSchema {
  createdAt: Date;
  fileName: String;
  status: String;
}

export const getMigrationsDir = () => {
  return path.join(__dirname, '..', '..', 'migrations');
}

export const updateChangelog = async (db: Db, changelogData: IChangelogSchema): Promise<void> => {
  if (!process.env.CHANGELOG_COLLECTION_NAME) return;

  try {
    await db.collection(process.env.CHANGELOG_COLLECTION_NAME).insertOne(changelogData);
  } catch (error) {
    console.log(error, 'Error while creating a changelog document');
  }
}

export const getMigrationsFileNames = () => {
  const migrationsDir = getMigrationsDir();
  
  const files = fs.readdirSync(migrationsDir);

  return files.sort();
}

export const checkIfMigrationApplied = async (db: Db, filenames: string[]): Promise<Array<string | void>> => {
  if (!process.env.CHANGELOG_COLLECTION_NAME) return filenames;

  const result = [];

  for (let i = 0; i < filenames.length; i++) {
    const fileName = filenames[i];

    const isLogsExist = await db.collection(process.env.CHANGELOG_COLLECTION_NAME).findOne({ fileName });

    if (isLogsExist?.status !== 'APPLIED') {
      result.push(fileName);
    }
  }

  return result
}