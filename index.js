const express = require("express");
const cors = require("cors");
const http = require("http");
const apiRouters = require("./routers");
const conn = require("./services/db");
const app = express();
const PORT = process.env.PORT || 8080;

const corsOptions = {
  optionsSuccessStatus: 200,
  exposedHeaders: ["x-auth-token"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouters);
const httpServer = http.createServer(app);

conn.connect();

httpServer.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`);
})