import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    availability: { type: Boolean, default: true },
});

const Food = mongoose.model('Food', foodSchema);

const foodItems = [
    { name: "Greek salad", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Salad", image: "food_1.png" },
    { name: "Veg salad", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Salad", image: "food_2.png" },
    { name: "Clover Salad", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Salad", image: "food_3.png" },
    { name: "Chicken Salad", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Salad", image: "food_4.png" },
    { name: "Lasagna Rolls", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls", image: "food_5.png" },
    { name: "Peri Peri Rolls", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls", image: "food_6.png" },
    { name: "Chicken Rolls", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls", image: "food_7.png" },
    { name: "Veg Rolls", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls", image: "food_8.png" },
    { name: "Ripple Ice Cream", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts", image: "food_9.png" },
    { name: "Fruit Ice Cream", price: 22, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts", image: "food_10.png" },
    { name: "Jar Ice Cream", price: 10, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts", image: "food_11.png" },
    { name: "Vanilla Ice Cream", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts", image: "food_12.png" },
    { name: "Chicken Sandwich", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich", image: "food_13.png" },
    { name: "Vegan Sandwich", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich", image: "food_14.png" },
    { name: "Grilled Sandwich", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich", image: "food_15.png" },
    { name: "Bread Sandwich", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich", image: "food_16.png" },
    { name: "Cup Cake", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Cake", image: "food_17.png" },
    { name: "Vegan Cake", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Cake", image: "food_18.png" },
    { name: "Butterscotch Cake", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Cake", image: "food_19.png" },
    { name: "Sliced Cake", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Cake", image: "food_20.png" },
    { name: "Garlic Mushroom", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg", image: "food_21.png" },
    { name: "Fried Cauliflower", price: 22, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg", image: "food_22.png" },
    { name: "Mix Veg Pulao", price: 10, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg", image: "food_23.png" },
    { name: "Rice Zucchini", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg", image: "food_24.png" },
    { name: "Cheese Pasta", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta", image: "food_25.png" },
    { name: "Tomato Pasta", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta", image: "food_26.png" },
    { name: "Creamy Pasta", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta", image: "food_27.png" },
    { name: "Chicken Pasta", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta", image: "food_28.png" },
    { name: "Butter Noodles", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles", image: "food_29.png" },
    { name: "Veg Noodles", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles", image: "food_30.png" },
    { name: "Somen Noodles", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles", image: "food_31.png" },
    { name: "Cooked Noodles", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles", image: "food_32.png" },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        console.log('DB Connected for seeding');

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        const assetsDir = path.join(__dirname, '..', 'frontend', 'src', 'assets');

        for (const item of foodItems) {
            const src = path.join(assetsDir, item.image);
            const dest = path.join(uploadsDir, item.image);
            if (fs.existsSync(src) && !fs.existsSync(dest)) {
                fs.copyFileSync(src, dest);
            }
        }
        console.log('Food images copied to uploads/');

        await Food.deleteMany({});
        console.log('Cleared existing food items');

        await Food.insertMany(foodItems);
        console.log(`Seeded ${foodItems.length} food items`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seedDB();
