const express = require("express");
const amqp = require("amqplib");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");

if (!process.env.DBHOST) {
  throw new Error("Please specify the databse host using environment variable DBHOST.");
}

if (!process.env.DBNAME) {
  throw new Error("Please specify the name of the database using environment variable DBNAME");
}

if (!process.env.RABBIT) {
  throw new Error("Please specify the name of the RabbitMQ host using environment variable RABBIT");
}

const RABBIT = process.env.RABBIT;
const DBNAME = process.env.DBNAME;
const DBHOST = process.env.DBHOST;

function connectDb() {
  console.log(`History service :: connecting to MongoDB at ${DBHOST}`);

  return mongodb.MongoClient.connect(DBHOST)
    .then(client => {
      console.log(`History service :: connected to MongoDB`);

      return client.db(DBNAME);
    })
}

function connectRabbit() {
  console.log(`History service :: connecting to RabbitMQ server at ${RABBIT}`);

  return amqp.connect(RABBIT)
    .then(messagingConnection => {
      console.log('History service :: connected to RabbitMQ');
      return messagingConnection.createChannel();
    });
}

function setupHandlers(app, db, messageChannel) {
  const videosCollection = db.collection("videos");

  function consumeViewedMessage(msg) {
    console.log('History service :: received a viewed message');

    const parsedMsg = JSON.parse(msg.content.toString());

    return videosCollection.insertOne({ videoPath: parsedMsg.videoPath }) // Record the "view" in the database.
      .then(() => {
        console.log('History service :: acknowledging message was handled.');
        
        messageChannel.ack(msg); // If there is no error, acknowledge the message.
      });
  }

  return messageChannel.assertQueue('viewed', {})
    .then(() => {
      console.log('History service :: asserted that the viewed queue exists');
      return messageChannel.consume('viewed', consumeViewedMessage);
    })
}

function startHttpServer(db, messageChannel) {
  return new Promise(resolve => { // Wrap in a promise so we can be notified when the server has started.
    const app = express();
    app.use(bodyParser.json()); // Enable JSON body for HTTP requests.
    setupHandlers(app, db, messageChannel);

    const port = process.env.PORT && parseInt(process.env.PORT) || 3000;
    app.listen(port, () => {
        resolve(); // HTTP server is listening, resolve the promise.
    });
  });
}

function main() {
  console.log("Hello world!");

  return connectDb()                                  // Connect to the database...
    .then(db => {                                     // then...
      return connectRabbit()                          // connect to RabbitMQ...
        .then(messageChannel => {                     // then...
          return startHttpServer(db, messageChannel); // start the HTTP server.
        });
    });
}

main()
  .then(() => console.log("History microservice online."))
  .catch(err => {
    console.error("History microservice failed to start!");
    console.error(err && err.stack || err);
  });
