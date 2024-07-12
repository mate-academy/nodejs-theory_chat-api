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

app.get('/messages', (req, res) => {
  messageEmitter.once('message', () => res.send(messages));
});

app.post('/messages', (req, res) => {
  const message = {
    text: req.body.text,
    time: new Date(),
  };

  messages.push(message);
  messageEmitter.emit('message');
  res.status(201).json(message);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
