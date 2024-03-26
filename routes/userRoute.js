const express = require('express');
const router = express.Router();
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Item = require('../model/item');

router.post("/register", async (req, res) => {
    try{
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
            shoppingCart: []
        })

        res.status(200).send("User Added to the Database")
    }
    catch(err){
        res.json({staus:'error', error: 'Duplicate email'})
    }
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    })

    if(!user){
        return res.json({status: 'error', error: 'Invalid Login'})
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    )

    if(isPasswordValid){
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email
            },
            'secret123'
        )

        return res.json({status:'Ok', user:token})
    }else{
        return res.json({status: 'error', user: false})
    }

})

//add new item to buy
router.post("/buy", async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    console.log(token)
    if (token == null) return res.sendStatus(401)

    try{
        const decoded = jwt.verify(token, 'secret123')

        const user = await User.findOne({
            email: decoded.email
        })

        if(!user){
            return res.json({status:'error', error:'Not a authorized User'})
        }


        //check if the item exists
        const item = await Item.findOne({title: req.body.buying});
         if (!item) {
             return res.status(404).json({status:"Error", error:"Item not found."})
         }

        await User.updateOne(
            {email: decoded.email},
            {$set: {buying: req.body.buying}}
            )
        
        return res.json({status: 'Ok'})
    }catch(error){
        return res.json({status:'error', error:'Invalid Token'})
    }
})

//adding an item to the cart
router.post("/addToCart/:itemName", async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const itemName = String(req.params.itemName);

    console.log(token)
    if (token == null) return res.sendStatus(401)

    try {
        const decoded = jwt.verify(token, 'secret123')

        const user = await User.findOne({
            email: decoded.email
        })

        if(!user){
            return res.json({status:'error', error:'Not a authorized User'})
        }

        if (!user.shoppingCart) {
            user.shoppingCart = []; // Initialize shoppingCart if it's undefined
        }

        // Check if the item exists
        const item = await Item.findOne({title: itemName});
         if (!item) {
             return res.status(404).json({status:"Error", error:"Item not found."})
         }

        // Add the item to the array (shopping cart)
        try {
            user.shoppingCart.push(itemName);
            await user.save();
            console.log(itemName + " added to Cart");
            console.log(user.shoppingCart)
        } catch(error) {
            console.log("Shopping cart addition failed: " + error);
        }
        
        return res.status(200).json({ status: 'success', message: `Item '${itemName}' added` });
    }catch(error){
        return res.json({status:'error', error:'Invalid Token'})
    }
})
//gets contents of shopping cart
router.get("/shoppingCart", async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    console.log(token)
    if (token == null) return res.sendStatus(401)

    try {
        const decoded = jwt.verify(token, 'secret123')

        const user = await User.findOne({
            email: decoded.email
        })

        if(!user){
            return res.json({status:'error', error:'Not a authorized User'})
        }

        const currentShoppingCart = user.shoppingCart;
        const items = await Item.find({title: {$in: currentShoppingCart}});
        console.log("Current Shopping Cart: " + currentShoppingCart);

        res.status(200).json({items});
    } catch (error) {
        return res.json({status:'error', error:'Invalid Token'})
    }
})
//removes an item from shopping cart by name
router.post('/removeFromCart/:itemName', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const itemName = String(req.params.itemName);

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, 'secret123');
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ status: 'error', error: 'Not an authorized User' });
        }

        // Get the index of the item to update
        const index = user.shoppingCart.indexOf(itemName);

        if (index === -1) {
            return res.status(404).json({ status: 'error', error: 'Item not found in user\'s shopping cart' });
        }

        // Update the item in the array
        user.shoppingCart[index] = "";

        // Save the updated retailer document
        await user.save();

        // Send success response
        res.status(200).json({ status: 'success', message: `Item '${itemName}' removed` });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
});

module.exports = router;