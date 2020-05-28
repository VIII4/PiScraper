const express = require("express");
const mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

const PORT = process.env.PORT || 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    helpers: {
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this);
        }
        return null;
      },
    },
  })
);
app.set("view engine", "handlebars");

///// Configure middleware

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/piScraper";

mongoose.connect(MONGODB_URI);

/////////// HTML Routes

//Route to Scrape then load page with info from database
app.get("/", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.roadtovr.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".item-details").each(function (i, element) {
      // Save an empty result object
      var result = {};

      result.headline = $(this).children("h3").text();
      result.url = $(this).find("a").attr("href");
      result.summary = $(this).find(".td-excerpt").text().trim();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {})
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    //RENDER TO BROWSER
    db.Article.find({})
      // Specify that we want to populate the retrieved users with any associated notes
      .populate("comments")
      .lean()
      .then(function (dbArticle) {
        var hbObject = {
          articles: dbArticle,
        };

        //If able to successfully find and associate all Users and Notes, send them back to the client
        res.render("index", hbObject);
      })
      .catch(function (err) {
        // If an error occurs, send it back to the client
        res.json(err);
      });
  });
});

//Route for saving a new comment to the db and associating it with a article
app.post("/comment/:id", function (req, res) {
  //Create a comment in the db with user name and comment
  db.Comment.create(req.body)
    .then(function (dbComment) {
      // If a Commment was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comments: dbComment._id } },
        { new: true }
      );
    })
    .then(function (dbComment) {
      // If the User was updated successfully, send it back to the client
      res.json(dbComment);
    })
    .catch(function (err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

//Route to Delete Comment
app.delete("/delete/:id", function (req, res) {
  db.Comment.deleteOne({ _id: req.params.id })
    .then(function (dbComment) {
      // If the User was updated successfully, send it back to the client
      res.json(dbComment);
    })
    .catch(function (err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
