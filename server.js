const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

const DIST_FOLDER = path.join(__dirname, 'dist', 'resume-ranker', 'browser');

app.use(express.static(DIST_FOLDER));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
