const express = require('express');
const router = express.Router();
const Item = require('../model/item');
const Retailer = require('../model/retailer');
const User = require('../model/user');
const Admin = require('../model/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.post("/register", async (req, res) => {
    try{
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await Admin.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword
        })

        res.status(200).send("Admin Added to the Database")
    }
    catch(err){
        res.json({staus:'error', error: 'Duplicate email'})
    }
})

router.post('/login', async (req, res) => {
    const admin = await Admin.findOne({
        email: req.body.email
    })

    if(!admin){
        return {status: 'error', error: 'Invalid Login'}
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        admin.password
    )

    if(isPasswordValid){
        const token = jwt.sign(
            {
                name: admin.name,
                email: admin.email
            },
            'secret123'
        )

        return res.json({status:'Ok', admin:token})
    }else{
        return res.json({status: 'error', admin: false})
    }

})

//adds item in collection by name
router.post('/items/add', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.sendStatus(401);
  }

  try {
      const decoded = jwt.verify(token, 'secret123');

      const admin = await Admin.findOne({ email: decoded.email });

      if (!admin) {
          return res.status(403).json({ status: 'error', error: 'You are not authorized to perform this action' });
      }


      //modify item
      const item = new Item(req.body)
      await item.save()
        res.status(201).send(item)


  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', error: 'An error occurred while adding the item' });
  }
});

//deletes items in collection by name
router.delete('/items/:name', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.sendStatus(401);
  }

  try {
      const decoded = jwt.verify(token, 'secret123');

      const admin = await Admin.findOne({ email: decoded.email });

      if (!admin) {
          return res.status(403).json({ status: 'error', error: 'You are not authorized to perform this action' });
      }


      //delete item
      const item = await Item.findOneAndDelete({ title: req.params.name });

      if (!item) {
          return res.json({ status: 'error', error: 'Item not found' });
      }

      res.json({ status: 'Ok', item: 'Item deleted successfully' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', error: 'An error occurred while deleting the item' });
  }
});

//modifies items in collection by name
router.patch('/items/:name', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.sendStatus(401);
  }

  try {
      const decoded = jwt.verify(token, 'secret123');

      const admin = await Admin.findOne({ email: decoded.email });

      if (!admin) {
          return res.status(403).json({ status: 'error', error: 'You are not authorized to perform this action' });
      }

      //modify item by name
      const updatedItem = await Item.findOneAndUpdate({ title: req.params.name }, req.body, { new: true });

      if (!updatedItem) {
          return res.json({ status: 'error', error: 'Item not found' });
      }

      res.json({ status: 'Ok', item: 'Item modified successfully', updatedItem });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', error: 'An error occurred while modifying the item' });
  }
});

// deletes retailer by name
router.delete('/retailers/:name', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.sendStatus(401);
  }

  try {
      const decoded = jwt.verify(token, 'secret123');


      const admin = await Admin.findOne({ email: decoded.email });

      if (!admin) {
          return res.status(403).json({ status: 'error', error: 'You are not authorized to perform this action' });
      }

      //delete retailer
      const retailer = await Retailer.findOneAndDelete({ name: req.params.name });

      if (!retailer) {
          return res.json({ status: 'error', error: 'Retailer not found' });
      }

      res.json({ status: 'Ok', retailer: 'Retailer deleted successfully' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', error: 'An error occurred while deleting the retailer' });
  }
});

// deletes user by name
router.delete('/users/:name', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.sendStatus(401);
  }

  try {
      const decoded = jwt.verify(token, 'secret123');

      const admin = await Admin.findOne({ email: decoded.email });

      if (!admin) {
          return res.status(403).json({ status: 'error', error: 'You are not authorized to perform this action' });
      }

      //delete user
      const deletedUser = await User.findOneAndDelete({ name: req.params.name });

      if (!deletedUser) {
          return res.json({ status: 'error', error: 'User not found' });
      }

      res.json({ status: 'Ok', user: 'User deleted successfully' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', error: 'An error occurred while deleting the user' });
  }
});
module.exports = router;