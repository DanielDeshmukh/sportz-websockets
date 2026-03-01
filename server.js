import express from 'express';
import {matchRouter} from "./routes/matches.js";

const app = express();
const port = 8000;

// Use JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.use('/matches', matchRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
