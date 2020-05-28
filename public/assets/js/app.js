//Functions

// Events
$(document).ready(function () {
  // On Submit comment click
  $(".btn-comment").click(function (event) {
    event.preventDefault();

    var $btn = $(this);
    var articleID = $btn.data("article-id");
    var commentID = $btn.data("comment-id");
    console.log(commentID, articleID);

    if (
      $(commentID + "-body").val() === "" ||
      $(commentID + "-user").val() === ""
    ) {
      alert("please enter a comment and username before submitting");
      return;
    }

    var commentData = {
      body: $(commentID + "-body")
        .val()
        .trim(),
      user: $(commentID + "-user")
        .val()
        .trim(),
    };

    $.ajax({
      method: "POST",
      url: "/comment/" + articleID,
      data: commentData,
    })
      // With that done
      .then(function (data) {
        // Log the response

        // Empty the notes section
        location.reload();
        $(commentID + "-body").val("");

        $(commentID + "-user").val("");
      });
  });

  $(".btn-delete").click(function (event) {
    event.preventDefault();

    var commentid = $(this).data("commentid");
    console.log(commentid);
    $.ajax({
      method: "DELETE",
      url: "/delete/" + commentid,
    }).then(function (res) {
      console.log(res);
      location.reload();
    });
    // $.ajax({
    //   method: "POST",
    //   url: "/comment/" + articleID,
    //   data: commentData,
    // })
    //   // With that done
    //   .then(function (data) {
    //     // Log the response

    //     // Empty the notes section
    //     location.reload();
    //     $(commentID + "-body").val("");

    //     $(commentID + "-user").val("");
    //   });
  });
});

//$(document).on("click", ".btn-comment", handleSubmitTask($(this)));
