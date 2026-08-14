const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'public/uploads/' });

app.use(express.json());
app.use(express.static('public'));

const listings = [];
const orders = [];

// Default account for @DogMan
const users = [
  { username: '@DogMan', password: '123', isSeller: true }
];

if (!fs.existsSync('public/uploads')) {
  fs.mkdirSync('public/uploads', { recursive: true });
}

// LOGIN & USER REGISTRATION
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please enter both username and password!' });
  }

  const cleanUsername = username.trim();
  const existingUser = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

  if (existingUser) {
    if (existingUser.password === password) {
      return res.json({ 
        success: true, 
        user: { username: existingUser.username, isSeller: existingUser.isSeller || false } 
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        error: `Username "${cleanUsername}" is already taken! Wrong password.` 
      });
    }
  } else {
    const newUser = { username: cleanUsername, password: password, isSeller: false };
    users.push(newUser);

    return res.json({ 
      success: true, 
      user: { username: newUser.username, isSeller: false },
      message: 'New account created successfully!'
    });
  }
});

// CHANGE PASSWORD ROUTE
app.post('/api/change-password', (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found!' });
  }

  if (user.password !== oldPassword) {
    return res.status(401).json({ success: false, error: 'Incorrect old password!' });
  }

  user.password = newPassword;
  res.json({ success: true, message: 'Password updated successfully!' });
});

app.get('/api/listings', (req, res) => res.json(listings));

// ONLY @DogMan CAN LIST ITEMS
app.post('/api/listings', upload.single('photo'), (req, res) => {
  const requestingUser = req.headers['x-username'];

  if (requestingUser !== '@DogMan') {
    return res.status(403).json({ error: 'Denied! Only @DogMan is allowed to list items!' });
  }

  const { title, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const newListing = {
    id: Date.now().toString(),
    title,
    price,
    ownerName: '@DogMan',
    imageUrl
  };

  listings.push(newListing);
  res.json({ success: true, listing: newListing });
});

app.post('/api/orders', (req, res) => {
  const { listingId, buyerName, fakeAddress } = req.body;
  if (!buyerName || !fakeAddress) {
    return res.status(400).json({ error: 'Please enter a name and address!' });
  }

  orders.push({ id: Date.now().toString(), listingId, buyerName, fakeAddress });
  res.json({
    success: true,
    message: `Order submitted! ${buyerName}, Dog Man will deliver to: "${fakeAddress}"!`
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐾 Dog Man Marketplace running on port ${PORT}`);
});