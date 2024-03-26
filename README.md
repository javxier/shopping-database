# shopping-database
A database to store shopping info

run "npm start" to start the server


admin.js is the model for the admin and adminRoute.js contains the relevant routes 
admin can add and modify items to the database; it can also delete items, users, and retailers from the database

items.js is the model for the items and itemRoute.js contains the relevant routes 
the items are a collection of objects with a title and description that are accessed by the accounts

retailer.js is the model for the retailers and retailerRoute.js contains the relevant routes 
retailer can change its list of items that it is selling based on what is in the item collection

user.js is the model for the users and userRoute.js contains the relevant routes 
user can buy items and add items to its shopping cart based on what is in the item collection