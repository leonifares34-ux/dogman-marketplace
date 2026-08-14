const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const upload = multer({ dest: path.join(__dirname, 'public/uploads/') });
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
const listings = [];
const orders = [];
const users = [{ username: 'DogManOfficial', password: 'dog man', isSeller: true }];
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); }
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username 
  const cleanUsername = username.trim();
  const existingUser = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (existingUser) {
    if (existingUser.password === password) {
      return res.json({ success: true, user: { username: existingUser.username, isSeller: existingUser.isSeller 
    } else {
      return res.status(401).json({ success: false, error: 'Wrong password!' });
    }
  } else {
    const newUser = { username: cleanUsername, password: password, isSeller: false };
    users.push(newUser);
    return res.json({ success: true, user: { username: newUser.username, isSeller: false }, message: 'Account created!' });
  }
});
app.get('/api/listings', (req, res) => res.json(listings));
app.post('/api/listings', upload.single('photo'), (req, res) => {
  if (req.headers['x-username'] !== 'DogManOfficial') return res.status(403).json({ error: 'Denied! Only DogManOfficial is allowed to list items!' });
  const { title, price } = req.body;
  const newListing = { id: Date.now().toString(), title, price, ownerName: 'DogManOfficial', imageUrl: req.file ? '/uploads/' + req.file.filename : '' };
  listings.push(newListing);
  res.json({ success: true, listing: newListing });
});
app.post('/api/orders', (req, res) => {
  const { listingId, buyerName, fakeAddress } = req.body;
  if (!buyerName 
  orders.push({ id: Date.now().toString(), listingId, buyerName, fakeAddress });
  res.json({ success: true, message: 'Order submitted!' });
});
const PORT = process.env.PORT 
app.listen(PORT, '0.0.0.0', () => console.log('Server running'));
