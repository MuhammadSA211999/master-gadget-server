const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000

const uri = "mongodb+srv://muhammad-sa:eqDocytc6pHtyoIS@cluster0.jjaj9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db("servicess").collection("service")

        // info post from client
        app.post('/addActivity', async (req, res) => {
            const activity = req.body
            if (!activity.name || !activity.email) {
                return res.send({ status: '500', success: 'false', message: "Please Provide all information" })
            }
            const result = await servicesCollection.insertOne(activity)
            res.send({ status: '400', success: 'true', message: `successfully booked ${activity.name}` })
        })

        // all data send to client
        app.get('/allactivities', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const allactivities = await cursor.toArray()
            res.send(allactivities)
        })

        // singleActivity by id
        app.get('/activity/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const activity = await servicesCollection.findOne(query)
            res.send(activity)
        })

        //user activity delete
        app.delete('/delete-a-activity/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.deleteOne(query)
            res.send(result)
            console.log(result.insertedId);
        })

        // user all activity 
        app.get('/userActivity', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
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