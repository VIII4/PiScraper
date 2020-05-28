var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
  // `title` must be of type String
  headline: {
    type: String,
    unique: true,
  },
  // `body` must be of type String
  summary: String,
  // `body` must be of type String
  url: String,

  comments: [
    {
      // Store ObjectIds in the array
      type: Schema.Types.ObjectId,
      // The ObjectIds will refer to the ids in the Note model
      ref: "Comment",
    },
  ],
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Note model
module.exports = Article;
