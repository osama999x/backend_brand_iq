const fetch = require("node-fetch");
const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const citiesRouter = express.Router();
citiesRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const where = encodeURIComponent(
      JSON.stringify({ name: { $exists: true } })
    );
    const response = await fetch(
      `https://parseapi.back4app.com/classes/City?count=1&limit=10&order=name&where=${where}`,
      {
        headers: {
          "X-Parse-Application-Id": "q1QfxhDv1KLM5OPzUFzZRIvYERUAFLWEWX9r053J",
          "X-Parse-Master-Key": "POcTYBgrQ52WGn2lJrcQrYwFFM44uhQ2eqmoy8hS",
        },
      }
    );
    const data = await response.json();
    res.status(200).send({ msg: "Cities", data: data.results });
  })
);
module.exports = citiesRouter;
