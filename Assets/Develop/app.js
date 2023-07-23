
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request body as JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    try {
      const notes = JSON.parse(data);
      return res.json(notes);
    } catch (parseErr) {
      console.error('Error parsing db.json:', parseErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and text are required fields' });
  }

  const newNote = {
    id: uuidv4(), 
    title,
    text,
  };

  fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading db.json:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    try {
      const notes = JSON.parse(data);
      notes.push(newNote);

      fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to db.json:', writeErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json(newNote);
      });
    } catch (parseErr) {
      console.error('Error parsing db.json:', parseErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});


app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
