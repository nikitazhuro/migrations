import * as fs from 'fs';
import * as path from 'path';

export const create = async (description: string) => {
  if (!description) {
    throw new Error("Missing parameter: description");
  }

  try {
    const source = path.join(__dirname, `../samples/migration.ts`);    
  
    const filename = `${Date.now()}_${description}.ts`;
    const destination = path.join(__dirname, '..', '..', 'migrations', filename);

    await fs.copyFile(source, destination, (error) => {
      console.log(error);
    });
  } catch (error) {
    console.log(error);
  }
}