const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Transactions = require("./models/transactions.js");
const bodyParser = require("body-parser");
const cors = require('cors');
require('dotenv').config(); // To load environment variables

const app = express();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Database connection error:", err));

// Helper function to create a search query
let filter;
let searchedQuery = async (searchQuery) => {
  let priceQuery = Number(searchQuery);
  filter = {
    $or: [
      { title: { $regex: searchQuery, $options: "i" } },
      { category: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
    ]
  };
  if (!isNaN(priceQuery)) {
    filter.$or.push({ price: priceQuery });
  }
};

// Helper function to get month name
function getMonthName(month) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[Number(month) - 1];
}

// /api/transactions route
app.get("/api/transactions", async (req, res) => {
  const searchQuery = req.query.searchQuery || "";
  const selectedMonth = req.query.month || "01";
  let currentPage = Number(req.query.page) || 1;
  let totalRecords = 0;

  try {
    let allRecords;
    if (selectedMonth === "0") {
      let skip = (currentPage - 1) * 10;
      allRecords = await Transactions.find().skip(skip).limit(10);
      totalRecords = await Transactions.countDocuments();
      if (searchQuery) {
        searchedQuery(searchQuery);
        allRecords = await Transactions.find(filter);
        totalRecords = await Transactions.countDocuments(filter);
      }
    } else {
      searchedQuery(searchQuery);
      if (selectedMonth) {
        filter.dateOfSale = { $regex: `-${selectedMonth}-` };
      }
      allRecords = await Transactions.find(filter);
      totalRecords = await Transactions.countDocuments(filter);
    }

    const totalPages = Math.ceil(totalRecords / 10);

    let statistics = {};
    if (selectedMonth !== "0") {
      statistics = await Transactions.aggregate([
        {
          $match: {
            dateOfSale: { $regex: `-${selectedMonth}-` }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $cond: [{ $eq: ["$sold", true] }, "$price", 0] } },
            totalSoldItems: { $sum: { $cond: [{ $eq: ["$sold", true] }, 1, 0] } },
            totalNotSoldItems: { $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] } }
          }
        }
      ]);
    }

    let categoryData = await Transactions.aggregate([
      {
        $match: {
          dateOfSale: { $regex: `-${selectedMonth}-` }
        }
      },
      {
        $group: {
          _id: "$category",
          itemCount: { $sum: 1 }
        }
      },
      {
        $sort: { itemCount: -1 }
      }
    ]);

    const barChartData = await Transactions.aggregate([
      {
        $match: {
          dateOfSale: { $regex: `-${selectedMonth}-` }
        }
      },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
          default: "901-above",
          output: {
            itemCount: { $sum: 1 }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      transactions: allRecords || [],
      totalPages,
      totalRecords,
      statistics: statistics[0] || {},
      barChartData,
      categoryData
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send("Error fetching transactions");
  }
});

// /populate-data route to populate data
app.get("/populate-data", async (req, res) => {
  try {
    const existingData = await Transactions.countDocuments();
    if (existingData > 0) {
      // Delete existing data before inserting new data
      await Transactions.deleteMany();
    }

    const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transactions.insertMany(data);
    res.send("Data populated successfully.");
  } catch (err) {
    console.error("Error populating data:", err);
    res.status(500).send("Failed to populate data");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`The app is listening on port ${PORT}`);
});
