const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000

const verifyToken = (req, res, next) => {
    const tokenWithBearer = req.headers.authorization
    console.log('verify-tokrn', tokenWithBearer);

    if (!tokenWithBearer) {
        res.status(401).send({ success: false, error: 'unauthorized access' })
    }
    const secretToken = tokenWithBearer.split(' ')[1]
    console.log(secretToken);

    jwt.verify(secretToken, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ success: false, message: 'forbidden access' })
        }
        console.log(decoded);
        req.decoded = decoded
        next()
    })
}

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.DB_PASSWORD}@cluster0.jjaj9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db("servicess").collection("service")
        // make a token 
        app.post('/login', async (req, res) => {
            const email = req.body
            const secretToken = jwt.sign(email, process.env.SECRET_TOKEN, { expiresIn: '2d' })
            res.send({ secretToken })
            console.log('secret token', secretToken);
            // res.status(200).send({data:secretToken,message:'successfully token make'})
        })


        // info post from client
        app.post('/addGadget', async (req, res) => {
            const gadget = req.body
            console.log(gadget);

            if (!gadget.name || !gadget.email || !gadget.image || !gadget.quantity || !gadget.price || !gadget.supplier) {
                return res.send({ status: 400, success: false, error: "Please Provide all information" })
            }
            const result = await servicesCollection.insertOne(gadget)
            res.send({ status: 200, success: true, message: `successfully added ${gadget.name}` })
        })

        // all data send to client
        app.get('/gadgets', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const gadgets = await cursor.toArray()
            res.send(gadgets)
        })

        // singleGadget by id
        app.get('/gadget/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const gadget = await servicesCollection.findOne(query)
            res.send(gadget)
        })

        // delete gadget
        app.delete('/deleteGadget/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.deleteOne(query)
            res.send(result)
            console.log(result);
        })

        // user all items with verification
        app.get('/myGadgets', verifyToken, async (req, res) => {
            const email = req.query.email
            const tokenEmail = req.decoded.email
            if (tokenEmail === email) {
                const query = { email: email }
                const cursor = servicesCollection.find(query)
                const result = await cursor.toArray()
                res.send(result)
            }
            else {
                res.status(401).send({ success: false, message: 'Hello Russian man!' })
            }
        })


        // renew a gadget
        app.put('/renewGadget/:id', async (req, res) => {
            const gadgetInfo = req.body
            console.log(gadgetInfo);

            const id = req.params.id
            console.log(id);

            if (!id && (!gadgetInfo.name || !gadgetInfo.price || !gadgetInfo.quantity || !gadgetInfo.image || !gadgetInfo.email)) {
                return res.send({ success: false, error: "Please gives necessary info correctly!" })
            }
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    name: gadgetInfo.name,
                    image: gadgetInfo.image,
                    email: gadgetInfo.email,
                    quantity: gadgetInfo.quantity,
                    price: gadgetInfo.price
                }
            }
            const result = await servicesCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })
        //    delivered one one ***
        app.put('/deliverUpdate/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);

            const newQuantity = req.body
            console.log(newQuantity);

            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: newQuantity.quantity - 1
                }
            }
            const result = await servicesCollection.updateOne(filter, updateDoc, option)
            res.send(result)

        })




        // addUpdate by one one**

        app.put('/restockGadget/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);

            const newQuantity = req.body
            console.log(newQuantity);
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    quantity: newQuantity.newQuantity
                }
            }
            const result = await servicesCollection.updateOne(filter, updateDoc, option)
            res.send(result)

        })

        // pagination
        app.get("/gadgetsByPaging", async (req, res) => {
            const limit = parseInt(req.query.limit);
            const pageNumber = parseInt(req.query.pageNumber);
            const count = await servicesCollection.estimatedDocumentCount();
            const cursor = servicesCollection.find();
            const gadgets = await cursor.skip(limit * pageNumber).limit(limit).toArray();
            if (!gadgets?.length) {
                return res.send({ success: false, error: "No product found" });
            }

            res.send({ success: true, data: gadgets, count: count })
        })


    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Server is running on website')
})
app.listen(port, () => {
    console.log('crud operation on console');

})