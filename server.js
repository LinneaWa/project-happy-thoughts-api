import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/projectHappyThoughtsAPI";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const MessageSchema = mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    // removes unnecessary whitespaces
    trim: true
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: () => new Date()
    // default: Date.now - this is for me to remember later
  }
});

const Message = mongoose.model("Message", MessageSchema);


// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Happy Thoughts API!!");
});

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({createdAt: 'desc'}).limit(20).exec();
  res.json(messages);
})

app.post('/messages', async (req, res) => {
  // retrieve information sent by client to our API endpoint
  const { message,createdAt } = req.body;
    console.log(req.body);
  try {
    const savedMessage = await new Message({message: message, createdAt: createdAt}).save()
    res.status(201).json({success: true, response: savedMessage});
  }catch (err){
    res.status(400).json({success: false, message: 'Could not save thought to database', error:err.errors });
  }
});

app.patch("/messages/:id/hearts", async (req, res) => {
  const { id } = req.params;
  try {
   const updateHearts = await Message.findByIdAndUpdate(id, {$inc: {hearts: 1}});
   res.status(200).json({success: true, response: `Happy thought: ${updateHearts.message} has updated likes`});
  } catch (error) {
   res.status(400).json({success: false, message: 'Could not save like to database', response: error});
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


