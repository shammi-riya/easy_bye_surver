const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors")
require("dotenv").config()
const port = process.env.PORT || 5000



// middleware
app.use(cors());
app.use(express.json());








const uri = `mongodb+srv://${process.env.usersName}:${process.env.password}@cluster0.f4myxpg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection



        const productsCollection = client.db("eazy_buy").collection("products");
        const cartsCollection = client.db("eazy_buy").collection("carts");



        app.get("/products", async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 10;
            const skip = page * limit;
            const result = await productsCollection.find().skip(skip).limit(limit).toArray();
            res.json(result);
        })


        app.get("/allProducts", async (req, res) => {
            const result = await productsCollection.estimatedDocumentCount();
            res.json({ allProducts: result });
        })


        app.get("/allProducts", async (req, res) => {
            const result = await productsCollection.estimatedDocumentCount();
            res.json({ allProducts: result });
        })



app.post("/shortbyproducts",async (req,res)=>{
  
    const { sortBy } = req.body;
 console.log(sortBy);

    let products;

    if (sortBy === 'price') {
      products = await productsCollection.find().sort({ price: -1 }); // Sort by price ascending
    } else if (sortBy === 'pricedes') {
      products = await productsCollection.find().sort({ price : 1 }); // Sort by ratings descending
    } else if (sortBy === 'ratings') {
      products = await productsCollection.find().sort({ ratingsCount: -1 }); // Sort by ratings descending
    } else {
      products = await productsCollection.find();
    }
console.log();
    res.send(await products.toArray());
})




        app.get("/someproducts", async (req, res) => {
           const result = await productsCollection.find().limit(12).toArray()
            res.send(result);
        })





          
         
        app.patch("/updateQuantity/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
          
            try {
              const product = await cartsCollection.findOne({ _id: id });
          
              if (!product) {
                return res.status(404).json({ error: 'Product not found' });
              }
          
              product.quantity = product.quantity + 1;
          
              const updatedProduct = await cartsCollection.updateOne(
                { _id: id },
                { $set: { quantity: product.quantity } }
              );
          
              res.send(updatedProduct);
            } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'this surver err' });
            }
          });




          app.patch("/decreaseQuantity/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
          
            try {
              const product = await cartsCollection.findOne({ _id: id });
          
              if (!product) {
                return res.status(404).json({ error: 'Product not found' });
              }
          
              if (product.quantity === 0) {
                return res.status(400).json({ error: 'this product cart not avalable' });
              }
          
              product.quantity = product.quantity - 1;
          
              const updatedProduct = await cartsCollection.updateOne(
                { _id: id },
                { $set: { quantity: product.quantity } }
              );
          
              res.send(updatedProduct);
            } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'surver err' });
            }
          });
          
             



          



        app.get("/carts", async(req, res) => {
            const email = req.query.email;
            if(!email){
                res.send([])
            }
           
            const quiry = {email:email}

            const result= await cartsCollection.find(quiry).toArray();
            res.send(result);
        })



        app.delete("/carts/:id" ,async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const quiry = {_id : id};
            const result = await cartsCollection.deleteOne(quiry);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Eazy bye rinning')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})