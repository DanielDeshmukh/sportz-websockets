import express from 'express';
import http from 'http';
import {matchRouter} from "./routes/matches.js";
import {attachWebsocketServer} from "./ws/server.js";

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const HOST = Number(process.env.HOST) || '0.0.0.0';
const server = http.createServer(app);

// Use JSON middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});

app.use('/matches', matchRouter);

const { broadcastMatchCreated } = attachWebsocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
server.listen(PORT,HOST,() => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://{HOST}:${PORT}/}`;
  console.log(`Websocket Server is running on ${ baseUrl.replace('http', 'ws')}/ws`);
});
