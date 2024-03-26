const express = require('express');
const router = express.Router();
const Item = require('../model/item');




//get item
router.get('/', async (req, res)=>{
    try{
        const items = await Item.find({})
        res.status(200).send(items)
    }catch(error){
        res.status(500).send(error)
    }
})




module.exports = router;