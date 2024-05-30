import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.routes.js";
import candidateRoutes from "./routes/candidate.routes.js";
// import voteRoutes from "./routes/vote.routes.js";
import connectDB from "./db.js";
import dotenv from "dotenv";
dotenv.config();

// connect to the database
connectDB();
// create an express app
const app = express();
const PORT = process.env.PORT || 3001;
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Voting system API is running successfully");
});

// define a simple route for the user and candidate
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);
// app.use("/vote", voteRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
