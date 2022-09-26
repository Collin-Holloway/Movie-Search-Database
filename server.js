const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
const { request, response } = require('express')
require('dotenv').config()
const PORT = 8000 

let db,
    dbConncetionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConncetionStr)
    .then(client => {
        console.log('Connected to database')
        db = client.db(dbName)
        collection = db.collection('movies')
    })

app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors)
//The below get brings back autocomplete terms while searching
app.get("/search", async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                "$Search" : {
                    "autocomplete" : {
                        "quary": `${request.query.query}`,
                        "path": "title",
                        "fuzzy": {
                            "maxEdits":2,
                            "prefixLength": 3
                        }
                    }
                }
            }
        ]).toArray()
        response.send(result)
    } catch (error) {
        response.status(500).send({message: error.message})
    }
})
//The below get brings back specific information of the serach
app.get("/get/:id", async (req, res) => {
    try {
        let result = await collection.findOne({
            "_id" : ObjectId(request.params.id)
        })
        response.send(result)
    } catch (error){
        response.status(500).send({message: error.message})
    }
})

app.listen(process.env.PORT || PORT, () => {
    console.log('Server is running')
})
