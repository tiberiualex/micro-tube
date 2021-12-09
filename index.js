const express = require('express');
const fs = require('fs');

const app = express();
const port = 3000;

app.get('/video', (req, res) => {
  const path = './videos/SampleVideo_1280x720_1mb.mp4';

  fs.stat(path, (err, stats) => {
    if (err) {
      console.error('An error occurred');
      res.sendStatus(500);
      return;
    }
    
    res.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(path).pipe(res);
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});