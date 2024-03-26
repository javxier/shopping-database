const mongoose = require('mongoose')

const retailerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    // allows the retailer to sell multiple items
    selling: {type: [String], required: true}
},{
    collection: 'retailers'
}   
)

const Retailer = new mongoose.model('Retailer', retailerSchema)

module.exports = Retailer