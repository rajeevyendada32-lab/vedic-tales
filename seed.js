const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ Connection error:', err));

const bookSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    coverImage: String,
    category: String
});

const Book = mongoose.model('Book', bookSchema);

const seedBooks = async () => {
    try {
        await Book.deleteMany({});
        console.log('🗑️  Cleared old books');

        await Book.create([
            {
                title: "Bharata: The King Whose Name Echoed",
                price: 499,
                description: "The story of the Mahabharata begins long before Kurukshetra. Follow the lineage of Bharata.",
                coverImage: "https://i.ibb.co/C5cWwvBV/IMG-20261005-WA8217.jpg",
                category: "Bharata Series"
            },
            {
                title: "Mahabharata: Yaksha Prashna",
                price: 299,
                description: "124 Divine Questions that saved lives. Includes modern life lessons.",
                coverImage: "https://i.ibb.co/n811M677/1.jpg",
                category: "Yaksha Prashna"
            },
            {
                title: "Yuyutsu: The One Who Walked Alone",
                price: 399,
                description: "The story of the only Kaurava who chose Dharma.",
                coverImage: "https://i.ibb.co/zhDNxxZJ/11.jpg",
                category: "Yuyutsu"
            }
        ]);

        console.log('✅ Books added successfully!');
        process.exit();
    } catch (err) {
        console.log('❌ Error:', err);
        process.exit(1);
    }
};

seedBooks();
