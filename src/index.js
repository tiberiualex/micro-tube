const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

if (!process.env.PORT) {
  throw new Error('Please specify the port number for the HTTP server with the env variable PORT');
}

const port = process.env.PORT;

app.get('/video', (req, res) => {
  const videoPath =  path.join('./videos', 'SampleVideo_1280x720_1mb.mp4');

  fs.stat(videoPath, (err, stats) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
    
    res.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath).pipe(res);
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});