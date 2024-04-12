const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const iv = Buffer.alloc(16, 0);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/EncryptUpload");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if connection fails
  }
}

connectToDatabase();

// UserSchema
const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    key: { type: String, required: false, unique: true },
  },
  { timestamps: true }
);

// User Model
const User = mongoose.model("User", UserSchema);

// SignUp
const SignUp = async (req, res) => {
  try {
    console.log(req.body);
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const key = crypto.scryptSync(hashedPassword, "salt", 24);
    console.log(key);
    const body = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      key: key,
    };
    const newUser = await User.create(body);
    console.log("New user created:", newUser);
    return res.status(200).json({ user: newUser });
  } catch (error) {
    console.error("Error creating new user:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// SignIn
const SignIn = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      const bool = await bcrypt.compare(
        req.body.password,
        existingUser.password
      );
      if (bool) res.status(200).json({ user: existingUser });
      else res.status(401).json({ message: "Unauthorized access" });
    } else res.status(404).json({ message: "user not found" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Encrypt Method
const encrypt = async (req, res) => {
  try {
    const existingUser = await User.findOne({ _id: req.body._id });
    const bool = await bcrypt.compare(req.body.password, existingUser.password);
    if (bool) {
      const inputFile = req.body.inputFile;
      const inputBuffer = fs.readFileSync(inputFile);
      const pass = crypto.scryptSync(req.body.key.toString("hex"), "salt", 24);
      const cipher = crypto.createCipheriv("aes-192-cbc", pass, iv);
      const encryptedBuffer = Buffer.concat([
        cipher.update(inputBuffer),
        cipher.final(),
      ]);
      console.log(encryptedBuffer.toString("utf-8"));

      fs.writeFileSync(
        `./${inputFile.split("\\")[2].split(".")[0]}.enc`,
        encryptedBuffer
      );

      res.status(200).json({
        ed: encryptedBuffer,
        key: pass,
        type: inputFile.split(".")[1],
      });
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Error encrypting file:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Decrypt Method
const decrypt = async (req, res) => {
  try {
    const existingUser = await User.findOne({ _id: req.body._id });
    const bool = await bcrypt.compare(req.body.password, existingUser.password);
    if (bool) {
      const inputFile = req.body.inputFile;
      const pass = crypto.scryptSync(req.body.key.toString("hex"), "salt", 24);

      const inputBuffer = fs.readFileSync(inputFile);
      const decipher = crypto.createDecipheriv("aes-192-cbc", pass, iv);
      const decryptedBuffer = Buffer.concat([
        decipher.update(inputBuffer),
        decipher.final(),
      ]);
      const lis = inputFile.split("\\");
      const fileName = lis[lis.length - 1].split(".")[0];
      fs.writeFileSync(
        `C:\\ed\\${fileName}1.${req.body.type}`,
        decryptedBuffer
      );

      res.status(200).json({ data: decryptedBuffer.toString("utf-8") });
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Error encrypting file:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Home Page
app.get("/", (req, res) => {
  res.send("Hello World");
});

// User Routes
app.post("/user/signin", SignIn);
app.post("/user/signup", SignUp);

// Crypto Routes
app.post("/encrypt", encrypt);
app.post("/decrypt", decrypt);

app.listen(5000, () => console.log("Server is running on port 5000"));
