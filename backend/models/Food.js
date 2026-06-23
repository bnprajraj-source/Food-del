import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide food name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide food description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide food price"],
      min: 0,
    },
    image: {
      type: String,
      required: [true, "Please provide food image"],
    },
    category: {
      type: String,
      required: [true, "Please provide food category"],
      enum: ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        comment: String,
        rating: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    availability: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model("Food", foodSchema);
export default Food;
