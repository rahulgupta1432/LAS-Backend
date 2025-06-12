const sendResponse = ({ res, status="success", code=200, data, message }) => {
    const responseData = Array.isArray(data) ? data : [data]; // Check if data is an array
  
    return res.status(code).json({
          status: status,
          code: code,
          message,
          data: responseData,
    });
  };
  
  export default sendResponse;


  /*

  <!-- Day01 Book Management System -->
Dekh mere pass ek Book krke Model hai usme title,author,year,categories
categories is in array of string, timestamp
iska CRUD banane ka hai 
aur phir ek Categories krke banane ka hai isme
name hoga sirf
Categories ka aur timestamp
aur uska bhi CRUD hoga lekin usme Delete Direct API se nhiii kr sakta matlab agar Book model mei Categories Id hai toh phir usko direct delete nhiii kr sakta first Release krna hoga
Categories Id ko Book mei
 aur jitne Categories hai uske count de ki book mei kitne Id hai
sab ke isko Aggregation method or Promise.all map se dono se dena

aur phir ek API de jo ki woh year based published hoga book

aur PHIr aab 
PBAC aur RBAC bana ek 
user hoga usme email,password hoga
aur role ek Admin,Editor,View
hoga Admin aur Editor Book aur Categories per sab CRUD kr sakte hai lekin bs Editor Delete nhii kr sakta Book ko aur phir Viewer sirf dekh sakta hai
using Node.js Mongoose




/my-app
|-- /models
|   |-- Book.js
|   |-- Category.js
|   |-- User.js
|-- /controllers
|   |-- bookController.js
|   |-- categoryController.js
|   |-- userController.js
|-- /routes
|   |-- bookRoutes.js
|   |-- categoryRoutes.js
|   |-- userRoutes.js
|-- /middleware
|   |-- auth.js
|-- server.js
|-- package.json



Book Model
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  timestamp: { type: Date, default: Date.now },
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;


CategoryModel
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;


User Model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], required: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;




//Controller  bookController
const Book = require('../models/Book');

// Create Book
exports.createBook = async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).send(book);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Read Books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('categories');
    res.send(books);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update Book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.query.id, req.body, { new: true });
    if (!book) return res.status(404).send();
    res.send(book);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete Book
exports.deleteBook = async (req, res) => {
  const user = req.user;
  if (user.role === 'Editor') {
    return res.status(403).send('Access denied. Editors cannot delete books.');
  }

  try {
    const book = await Book.findById(req.query.id);
    if (!book) return res.status(404).send();
    await book.remove();
    res.send(book);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get Books by Year
exports.getBooksByYear = async (req, res) => {
  try {
    const books = await Book.find({ year: req.query.year }).populate('categories');
    res.send(books);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Count Categories in a Book
exports.getCategoryCount = async (req, res) => {
  try {
    const book = await Book.findById(req.query.id).populate('categories');
    if (!book) return res.status(404).send();

    const categoryCount = book.categories.length;
    res.send({ categoryCount });
  } catch (error) {
    res.status(500).send(error);
  }
};





//userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });
  await user.save();
  res.status(201).send('User registered');
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid email or password.');

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.send({ token });
};

// Get User Info
exports.getUserInfo = (req, res) => {
  res.send(req.user);
};


//1. Book Routes (routes/bookRoutes.js)

const express = require('express');
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize'); // Import the authorize middleware
const router = express.Router();

router.post('/', auth, authorize('Admin', 'Editor'), bookController.createBook);
router.get('/', bookController.getBooks);
router.put('/', auth, authorize('Admin', 'Editor'), bookController.updateBook);
router.delete('/', auth, authorize('Admin'), bookController.deleteBook);
router.get('/year', bookController.getBooksByYear);
router.get('/category-count', bookController.getCategoryCount);

module.exports = router;


module.exports = router;


//2. Category Routes (routes/categoryRoutes.js)
const express = require('express');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize'); // Import the authorize middleware
const router = express.Router();

router.post('/', auth, authorize('Admin', 'Editor'), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.put('/', auth, authorize('Admin', 'Editor'), categoryController.updateCategory);
router.delete('/', auth, authorize('Admin'), categoryController.deleteCategory);

module.exports = router;



//3. User Routes (routes/userRoutes.js)

const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/me', auth, userController.getUserInfo);

module.exports = router;



//server.js



const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


MONGODB_URI=mongodb://yourMongoDBConnectionString
JWT_SECRET=yourJWTSecretKey




//Middleware
1. Create a Middleware File (middleware/auth.js)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // The user role from the verified token
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).send('Access denied.');
    }
    next();
  };
};

module.exports = authorize;

*/