import ora from 'ora';
import { Db, MongoClient } from 'mongodb';

import { connect } from '../env/database';
import { getMigrationsFileNames } from '../utils';
import { IChangelog } from '../types';

export const status = async () => {
  let client: MongoClient;
  let db: Db;
  const spinner = ora('Connecting to MongoDb').start();

  try {
    const connection = await connect();
    
    client = connection.client;
    db = connection.db;

    spinner.succeed('Db connected successfully').stop();
  } catch (error) {
    spinner.fail(`Error while mongo connection`);
    throw new Error('Error while mongo connection');
  }

  try {
    if (!process.env.CHANGELOG_COLLECTION_NAME) return [];

    const allMigrationsFiles = getMigrationsFileNames();
    const changelog = await db.collection(process.env.CHANGELOG_COLLECTION_NAME).find({}).toArray() as IChangelog[];

    const statusTable = allMigrationsFiles.map((fileName) => {
      const itemInLog = changelog.find((item) => item.fileName === fileName);
  
      const { status = 'PENDING', createdAt = null } = itemInLog || {};
      return { fileName, createdAt, status };
    }); 

    return statusTable;
  } catch (error) {
    console.log(error);
  }

  return []
}