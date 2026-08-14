import express from "express";
const app = express();
const server = app.listen(3111, () => {
  console.log("minimal server running on 3111");
});
console.log("minimal listen called, server assigned");
