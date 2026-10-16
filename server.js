const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'bookstore-secret-key',
    resave: false,
    saveUninitialized: true
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

const bookSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    coverImage: String,
    category: String
});
const Book = mongoose.model('Book', bookSchema);

const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    books: [{ title: String, price: Number }],
    total: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// Home with search
app.get('/', async (req, res) => {
    try {
        const search = req.query.search || '';
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }
        const books = await Book.find(query);
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        res.render('index', { books, cartCount, search });
    } catch (err) { res.send('Error: ' + err.message); }
});

// Single Book
app.get('/book/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        res.render('book', { book, cartCount });
    } catch (err) { res.send('Error: ' + err.message); }
});

// Add to Cart
app.post('/add-to-cart/:id', (req, res) => {
    if (!req.session.cart) req.session.cart = [];
    req.session.cart.push(req.params.id);
    res.redirect('/');
});

// View Cart
app.get('/cart', async (req, res) => {
    try {
        const cartIds = req.session.cart || [];
        const books = await Book.find({ _id: { $in: cartIds } });
        const total = books.reduce((sum, b) => sum + b.price, 0);
        res.render('cart', { books, total, cartCount: cartIds.length });
    } catch (err) { res.send('Error: ' + err.message); }
});

// Remove from Cart
app.post('/remove-from-cart/:id', (req, res) => {
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(id => id !== req.params.id);
    }
    res.redirect('/cart');
});

// Checkout
app.get('/checkout', async (req, res) => {
    try {
        const cartIds = req.session.cart || [];
        const books = await Book.find({ _id: { $in: cartIds } });
        const total = books.reduce((sum, b) => sum + b.price, 0);
        res.render('checkout', { books, total, cartCount: cartIds.length });
    } catch (err) { res.send('Error: ' + err.message); }
});

// Place Order
app.post('/place-order', async (req, res) => {
    try {
        const cartIds = req.session.cart || [];
        const books = await Book.find({ _id: { $in: cartIds } });
        const total = books.reduce((sum, b) => sum + b.price, 0);

        const order = new Order({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            books: books.map(b => ({ title: b.title, price: b.price })),
            total: total
        });
        await order.save();

        req.session.cart = [];
        res.render('confirmation', { order });
    } catch (err) { res.send('Error placing order: ' + err.message); }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
