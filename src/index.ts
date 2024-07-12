import express from 'express';
import cors from 'cors';
import EventEmitter from 'node:events';

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
