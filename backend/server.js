const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const sessions = [];
let sessionId = 1;

// Track user journey across channels
app.post('/api/session', (req, res) => {
  const { userId, channel, action, data } = req.body;
  
  const session = {
    id: sessionId++,
    userId,
    channel,
    action,
    data,
    timestamp: new Date()
  };
  
  sessions.push(session);
  res.json(session);
});

// Get user's cross-channel history
app.get('/api/session/:userId', (req, res) => {
  const userSessions = sessions.filter(s => s.userId === req.params.userId);
  res.json(userSessions);
});

// Resume session from different channel
app.post('/api/resume', (req, res) => {
  const { userId, newChannel } = req.body;
  const lastSession = sessions.filter(s => s.userId === userId).pop();
  
  if (lastSession) {
    res.json({
      canResume: true,
      lastAction: lastSession.action,
      lastChannel: lastSession.channel,
      data: lastSession.data,
      message: `Resume your ${lastSession.action} from ${lastChannel} on ${newChannel}`
    });
  } else {
    res.json({ canResume: false });
  }
});

const PORT = 3006;
app.listen(PORT, () => console.log(`OmniGov API on port ${PORT}`));
