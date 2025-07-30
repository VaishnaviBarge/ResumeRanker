const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist/resume-ranker
app.use(express.static(path.join(__dirname, 'dist/resume-ranker')));

// Fallback to index.html for SPA routing
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/resume-ranker/index.html'));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
