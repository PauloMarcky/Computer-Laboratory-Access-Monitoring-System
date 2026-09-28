require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // frontend (Vite, port 3001) calls this API directly from the browser
app.use(express.json());

app.use('/api/users', require('./routes/user-routes'));
app.use('/api/v1/attendance', require('./routes/attendance-routes'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Server listening on port ${PORT}`);
});