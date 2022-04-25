const express = require('express')
const exphbs = require("express-handlebars");

// Express
const app = express()
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Handlebars
const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    // create custom helpers
    helpers: {
      capitaliseFirstLetter: function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
      replaceHyphens: function (str) {
        return str.replaceAll("-", " ");
      },
    },
  });
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// Routers
const baseRouter = require("./routes/baseRouter");
app.use("", baseRouter)

// Listen
app.listen(process.env.PORT || 3000, () => {
    console.log('App listening')
})