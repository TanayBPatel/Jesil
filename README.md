Deployment link  https://jesil.onrender.com/

Pls READ this 

I have included the following ROUTES in the project:

/login                      req.body contains username, email, password                 POST
/register                   req.body contains email, password                           POST


/videos                     req.body contains NA It lists all videos in the db                                  GET
/videos?category=Database   req.body contains NA It lists all videos in the db with the category Database       GET
                (above Database is an Example of Category)
/videos?title=Machine       req.body contains NA It lists all videos in the db with the title machine           GET
            (above Database is an Example of Title)
/videos/:id/reviews         req.body contains rating, comment, NOTE : POST rating in INTEGER                    POST



/bookmarks                  req.body contains NA It lists all videos that the particular user has BOOKMARKED    POST
/bookmark/:videoId          req.body contains NA, it saves that particular video as bookmarked by the user      GET




the schema for the deployment link is 

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
});
const User = mongoose.model("User", UserSchema);

// Video Schema
const VideoSchema = new mongoose.Schema({
  title: String,
  category: String,
  url: String,
  duration: String,
  difficulty: String,
  views: String,
  reviews: [{ user: String, rating: Number, comment: String }]
});
const Video = mongoose.model("Video", VideoSchema);



# 1
