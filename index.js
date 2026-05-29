import dotenv from "dotenv"
dotenv.config()
import express from "express"
const app = express()
const port = process.env.PORT || 5100
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fileUpload from "express-fileupload";
import helmet from "helmet"
import mongoose from "mongoose";
import AdminAuth from "./private/AdminAuth.js"
import Pages from "./page/Pages.js"
import AuthRoute from "./routes/AuthRoute.js"
import LecRoute from "./private/LecRoute.js"

mongoose.connect(process.env.MONGO_DEVT_URL)

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(){
    console.log("connected to database");
  });


app.set('view engine', 'ejs');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));

app.set('views', join(__dirname, 'views')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 app.use(fileUpload({
    useTempFiles: true
}))


app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",           // already here
        "https://in.paychangu.com",
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",           // already here
      ],
      workerSrc: [
        "'self'",
        "blob:",
        "https://cdnjs.cloudflare.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://res.cloudinary.com",
      ],
      connectSrc: [
        "'self'",
        "https://in.paychangu.com",
        "https://api.paychangu.com",
        "https://cdnjs.cloudflare.com",
        "blob:",
        "https://res.cloudinary.com",
        "https://cdn.jsdelivr.net",          
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",          
      ],
      frameSrc: [
        "https://test-checkout.paychangu.com",
        "https://checkout.paychangu.com",
      ],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  })
);


app.use(Pages)
app.use(AdminAuth)
app.use(AuthRoute)
app.use(LecRoute)



app.listen(port, () => {
    console.log(`Your system is running on port ${port}`)
})