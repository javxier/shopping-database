// Add your mongodb cloud username and password and
// run the app using npm start you will see logs saying
// database connected.

const mongoose = require("mongoose");
const express = require("express");

const itemRoutes = require('./routes/itemRoute');
const userRoutes = require('./routes/userRoute');
const adminRoutes = require('./routes/adminRoute');
const retailerRoutes = require('./routes/retailerRoute');


const app = express();
app.use(express.json())

//connecting our database
const password = "Ah4VmhLstQO6P9dR";
const dbName = "ecommerce"
//const dbURL = "mongodb+srv://blog_user:" + password + "@cluster0.grs5zyl.mongodb.net/" + dbName + "?retryWrites=true&w=majority";

const dbURI = "mongodb+srv://simonkaley:" + password + "@cluster1.gx4rx6d.mongodb.net/" + dbName + "?retryWrites=true&w=majority&appName=Cluster1";

mongoose
  .connect(dbURI)
  .then((result) =>
    app.listen(3000, (req, res) => {
      console.log("Connected to DB listening on port 3000");
    })
  )
  .catch((error) => console.log(error));



  app.use('/items', itemRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/retailer', retailerRoutes);