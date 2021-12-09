const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

app.get('/video', (res, req) => {
  const path = './videos/SampleVideo_1280x720_1mb.mp4';

  fs.stat(path, (err, stats) => {
    if (err) {
      console.error('An error occurred');
      res.sendStatus(500);
      return;
    }
  
    res.writeHead(200, {
      "Content-Length": fs.Stats.size
    });

    fs.createReadStream(path).pipe(res);
  });
});
