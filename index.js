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
    if (!tokenWithBearer) {
        res.status(401).send({ success: false, error: 'unauthorized access' })
    }
    const secretToken = tokenWithBearer.split(' ')[1]
    jwt.verify(secretToken, process.env.SECRET_TOKEN, (error, decoded) => {
        if (error) {
            res.status(403).send({ success: 0, message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}

const uri = "mongodb+srv://muhammad-sa:eqDocytc6pHtyoIS@cluster0.jjaj9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
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
            const activity = await servicesCollection.findOne(query)
            res.send(activity)
        })

        //user activity delete
        app.delete('/deleteGadget/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.deleteOne(query)
            res.send(result)
            console.log(result.insertedId);
        })

        // user all items
        app.get('/myGadgets', async (req, res) => {
            const email = req.query.email
            // const tokenEmail = req.decoded.email
            // if (tokenEmail === email) {
            const query = { email: email }
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
            // }
        })
        // update a gadget
        app.put('/updateGadget/id', async (req, res) => {
            const gadgetInfo = req.body
            const gadgetId = req.params.id
            if (!gadgetId && (!gadgetInfo.name || !gadgetInfo.email || !gadgetInfo.price || !gadgetInfo.supplier)) {
                return res.send({ success: false, result: 0, error: "Please gives necessary info correctly!" })
            }
            const filter = { _id: (ObjectId(id)) }
            const option = { upsert: true }
            const updateGadget = {
                $set: { ...gadgetInfo }
            }
            const result = await servicesCollection.updateOne(filter, option, updateGadget)
            res.send({ success: true, result: result, message: 'Well done!' })

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