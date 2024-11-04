import { Db, MongoClient, WithId, Document } from "mongodb";

export interface MigrationObject {
  up(db: Db, client: MongoClient): Promise<void | never>;
  down(db: Db, client: MongoClient): Promise<void | never>;
}

export interface IChangelog extends WithId<Document> {
  status: 'APPLIED' | 'ERROR';
  fileName: string;
  createdAt: Date;
}

export interface IChangelogData {
  createdAt: Date;
  fileName: string;
  status: string;
}