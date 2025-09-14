const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

const filePath = path.join(__dirname, "../data/whitelistGreggs.json");

app.get("/whitelistGreggs.json", (req, res) => {
  if (!fs.existsSync(filePath)) return res.json([]);
  res.setHeader("Content-Type", "application/json");
  res.send(fs.readFileSync(filePath, "utf-8"));
});

app.listen(PORT, () => {
  console.log(`Greggs Whitelist server listening on PORT ${PORT}`);
});
