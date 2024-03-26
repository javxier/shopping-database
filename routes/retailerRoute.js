const express = require('express');
const router = express.Router();
const Retailer = require('../model/retailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Item = require('../model/item');

router.post("/register", async (req, res) => {
    try{
        const newPassword = await bcrypt.hash(req.body.password, 10)
        await Retailer.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword
        })

        res.status(200).send("Retailer Added to the Database")
    }
    catch(err){
        res.json({staus:'error', error: 'Duplicate email'})
    }
})

router.post('/login', async (req, res) => {
    const retailer = await Retailer.findOne({
        email: req.body.email
    })

    if(!retailer){
        return res.json({status: 'error', error: 'Invalid Login'})
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        retailer.password
    )

    if(isPasswordValid){
        const token = jwt.sign(
            {
                name: retailer.name,
                email: retailer.email
            },
            'secret123'
        )

        return res.json({status:'Ok', retailer:token})
    }else{
        return res.json({status: 'error', retailer: false})
    }

})



//updates item sold by user
router.post("/sell", async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    console.log(token)
    if (token == null) return res.sendStatus(401)

    try{
        const decoded = jwt.verify(token, 'secret123')

        const retailer = await Retailer.findOne({
            email: decoded.email
        })

        //checks for retailer
        if(!retailer){
            return res.json({status:'error', error:'Not a authorized Retailer'})
        }


        await Retailer.updateOne(
            {email: decoded.email},
            {$set: {selling: req.body.selling}}
            )
        
        return res.json({status: 'Ok'})
    }catch(error){
        return res.json({status:'error', error:'Invalid Token'})
    }
})

//gets a single item sold by retailer no authorization because only a get method. 
router.get('/itemGet/:itemName', async (req, res)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, 'secret123');

        const retailer = await Retailer.findOne({ email: decoded.email });

        if (!retailer) {
            return res.status(401).json({ status: 'error', error: 'Not an authorized Retailer' });
        }

        //gets selling items from retailer 
        const itemName = String(req.params.itemName);

        //Shows item that the retailer is selling
        const items = await Item.find({ title: itemName });
        
        //Send the items as a response
        res.status(200).json({ items });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
});

//gets all items that the retailer is selling
router.get('/itemGetAll', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, 'secret123');

        const retailer = await Retailer.findOne({ email: decoded.email });

        if (!retailer) {
            return res.status(401).json({ status: 'error', error: 'Not an authorized Retailer' });
        }

        //gets selling items from retailer 
        const sellingItems = retailer.selling;
        console.log(sellingItems);

        //Shows items that the retailer is selling
        const items = await Item.find({ title: { $in: sellingItems } });
        
        //Send the items as a response
        res.status(200).json({ items });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
});

//updates the old item to the new item
router.post('/itemUpdate/:itemName/:newItemName', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const itemName = String(req.params.itemName);
    const newItemName = String(req.params.newItemName);

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, 'secret123');
        const retailer = await Retailer.findOne({ email: decoded.email });

        if (!retailer) {
            return res.status(401).json({ status: 'error', error: 'Not an authorized Retailer' });
        }

        // Get the index of the item to update
        const index = retailer.selling.indexOf(itemName);

        if (index === -1) {
            return res.status(404).json({ status: 'error', error: 'Item not found in retailer\'s selling list' });
        }

        // Update the item in the array
        retailer.selling[index] = newItemName;

        // Save the updated retailer document
        await retailer.save();

        // Send success response
        res.status(200).json({ status: 'success', message: `Item '${itemName}' updated to '${newItemName}'` });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', error: 'Internal server error' });
    }
});

module.exports = router;