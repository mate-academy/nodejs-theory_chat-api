import express from 'express';
import cors from 'cors';
import EventEmitter from 'node:events';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

type Message = {
  text: string;
  time: Date;
};

const messages = [] as Message[];
const messageEmitter = new EventEmitter();

app.get('/message', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  const callback = (data: Message) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  messageEmitter.on('message', callback);
  req.on('close', () => messageEmitter.off('message', callback));
});

app.post('/messages', (req, res) => {
  const message = {
    text: req.body.text,
    time: new Date(),
  };

  messages.push(message);
  messageEmitter.emit('message', message);
  res.status(201).json(message);
});

const server = app.listen(PORT);
const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
  // Event handler for new client connections
  console.log('A new client connected');

  // Event handler for receiving data from clients
  client.on('message', (data) => {
    console.log(`Received data: ${data}`);

    // Sending a response to the client
    client.send('Data received');
  });
});

messageEmitter.on('message', (data) => {
  for (const client of wss.clients) {
    client.send(JSON.stringify(data));
  }
});
