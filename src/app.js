import { MongoClient } from 'mongodb';

const uri = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect((error) => {
  if (error) {
    return console.log('could not connect to the database.');
  }

  const db = client.db(databaseName);

  db.collection('users').insertOne({
    name: 'Monday Victor',
    age: 27,
  });
});
