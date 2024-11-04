import { MongoClient } from 'mongodb';

export const connect = async () => {
  const connectionString = process.env.MONGO_URL;
  const databaseName ='ws-test';
  const options = {};

  if (!connectionString) {
    throw new Error("No `url` defined in config file!");
  }

  const client = await MongoClient.connect(
    connectionString,
    options
  );
 
  const db = client.db(databaseName);

  return {
    client,
    db,
  };
}