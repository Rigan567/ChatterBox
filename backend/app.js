//External Imports
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const moment = require("moment");
const path = require("path");
const cookieParser = require("cookie-parser");
const loginRouter = require("./router/loginRouter");
const usersRouter = require("./router/usersRouter");
const inboxRouter = require("./router/inboxRouter");
const cors = require("cors");

//internal imports
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/common/errorHandlers");
// const { checkLogin } = require("./middlewares/common/checkLogin");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://chatter-box-chi-three.vercel.app",
  "https://chatter-1iwp0jyjh-rigans-projects-12fb309f.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.locals.moment = moment;

const mongoURI = process.env.MONGODB_URI || process.env.MONGO_CONNECTION_STRING;

//db connection
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log(
      `DB connected successfully on ${process.env.MONGO_CONNECTION_STRING} `
    );
  })
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set static folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

//parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(checkLogin);

//routing setup
app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// ------------------------Deployment-----------------------
// const __dirname1 = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/frontend/build")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is Running Successfully");
//   });
// }

// ------------------------Deployment-----------------------

//404 error handling
app.use(notFoundHandler);

//common error handling
app.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT} `);
});
