import express from "express";
import Candidate from "../models/candidate.model.js";
import User from "../models/user.model.js";
import { jwtAuthMiddleware } from "../auth/jwt.js";
const router = express.Router();

// to check the role of the user if it is admin or not  by checking the role of the user
const checkAdmin = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
    }
    console.log("User role is:", user.role);
    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    console.error("Error occurred during checking user role:", error);
    return false;
  }
};

//post request to create a new candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  //   console.log("req.user", req.user.userData.id);
  //   console.log("req.user.id", req.user.);
  try {
    if (!(await checkAdmin(req.user.userData.id))) {
      return res.status(403).send("You are not authorized to add a candidate");
    }
    //create a new candidate
    const candidate = new Candidate(req.body);
    //save the candidate
    const response = await candidate.save();
    console.log("Candidate created successfully");
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error occurred during signup of candidate:", error);
    res.status(500).send(error);
  }
});

//for updating a person
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    // check if the user is admin or not
    if (!(await checkAdmin(req.user.userData.id))) {
      return res
        .status(403)
        .send("You are not authorized to update a candidate");
    }
    // update the candidate by id and return the new updated candidate object after update operation
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      req.body,
      {
        new: true,
      }
    );
    if (!candidate) {
      return res.status(404).send("Candidate not found");
    }
    res.status(200).json({ candidate });
  } catch (error) {
    console.error("Error occurred during updating candidate:", error);
    res.status(500).send(error);
  }
});

// delete a candidate by id
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    // check if the user is admin or not
    if (!(await checkAdmin(req.user.userData.id))) {
      return res
        .status(403)
        .send("You are not authorized to delete a candidate");
    }
    // delete the candidate by id and return the deleted candidate object
    const candidate = await Candidate.findByIdAndDelete(req.params.candidateId);
    if (!candidate) {
      return res.status(404).send("Candidate not found");
    }
    res.status(200).json({ candidate });
  } catch (error) {
    console.error("Error occurred during deleting candidate:", error);
    res.status(500).send(error);
  }
});

// route to vote for a candidate
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //admin cant vote
  // only one vote per user
  const candidateId = req.params.candidateId;
  const userId = req.user.userData.id;
  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).send("Candidate not found");
    }
    const user = await User.findById(userId); //find the user by id
    if (!user) {
      return res.status(404).send("User not found");
    }
    if (user.isVoted) {
      return res.status(403).send("You have already voted");
    }
    if (user.role === "admin") {
      return res.status(403).send("Admin cant vote and is not allowed to vote");
    }
    //update candidate
    candidate.votes.push({ user: userId }); //push the user id to the votes array of the candidate
    candidate.voteCount++; //increment the votes of the candidate
    await candidate.save(); //save the candidate

    //update user
    user.isVoted = true; //set the isVoted to true
    await user.save(); //save the user
    res.status(200).json({ message: "Voted successfully" }); // can include the candidate name also to send who the user voted for
  } catch (error) {
    console.error("Error occurred during voting for candidate: \n", error);
    res.status(500).send(error);
  }
});

// vote count
router.get("/vote/count", async (req, res) => {
  try {
    // to show the vote count of the candidate by descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    const record = candidate.map((candidate) => {
      return {
        electionParty: candidate.electionParty,
        voteCount: candidate.voteCount,
      };
    });

    return res.status(200).json(record);
  } catch (error) {
    console.error(
      "Error occurred during getting vote count for candidate:",
      error
    );
    res.status(500).send(error);
  }
});

export default router;
