var express = require("express");
const cors = require("cors");
var filesys = require("fs");
var path = require("path");
const morgan = require("morgan");


let app = express();

var staticPath = path.resolve(__dirname, "public/img");
app.use("/img", express.static(staticPath));

const logsPath = path.join(__dirname, 'logs');
if (!filesys.existsSync(logsPath)) {
    filesys.mkdirSync(logsPath);
}
const logsReq = filesys.createWriteStream(path.join(logsPath, 'logs'), { flags: 'a' });

app.use(morgan('combined', { stream: logsReq }));


let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);

let dbPrefixx = properties.get("db.prefix");
let dbUsername = properties.get("db.user");
let dbPwd = properties.get("db.pwd");
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

const uri = dbPrefixx + dbUsername + ":" + dbPwd + dbUrl + dbParams;

const { MongoClient, ServerApiVersion, ObjectID, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);


var staticFolder = path.resolve(__dirname, "public");
app.use("/public", express.static(staticFolder));

app.set('json spaces', 2);
app.use(cors());
app.use(express.json());
app.use(morgan("short"));


app.get("/", function (req, res) {
    res.send({
        "Message": "Welcome...! CST3145 Coursework II. RestfulAPI",
        "API": {
            "get": process.env.URL || "http://localhost:3000" + "/api/lessons/",
            "get (single record by id)": process.env.URL || "http://localhost:3000" + "/api/lessons/1",
            "get (single record by objectid)": process.env.URL || "http://localhost:3000" + "/api/lessons/63df860af60471ad43cba852",
            "post": process.env.URL || "http://localhost:3000" + "/api/lessons/",
            "post": process.env.URL || "http://localhost:3000" + "/api/orders/",
            "post": process.env.URL || "http://localhost:3000" + "/api/users/",
            "put (single record by id)": process.env.URL || "http://localhost:3000" + "/api/lessons/1",
            "put (single record by objectid)": process.env.URL || "http://localhost:3000" + "/api/lessons/63df860af60471ad43cba852",
            "delete (single record by id)": process.env.URL || "http://localhost:3000" + "/api/lessons/1",
            "delete (single record by objectid)": process.env.URL || "http://localhost:3000" + "/api/lessons/63df860af60471ad43cba852",
        },
        "IMPORTANT URLs": {
            "HTTP AWS API": "http://cst3145cw2-env.eba-4qwhppzp.us-east-1.elasticbeanstalk.com/",
            "HTTPS AWS API": "https://cst3145cw2-env.eba-4qwhppzp.us-east-1.elasticbeanstalk.com/",
            "Github Repository": "YET TO COME",
            "GITHUB SITE": "YET TO COME"
        }
    });
});

app.get("/api/sorting/:collection?/:field?/:ordering?", async function (req, res) {

    const { collection, field, ordering } = req.params;

    coll = db.collection(collection);

    if (!collection) {

        res.send({
            "ERROR": "Its look like you are sorting but what you are sorting is not clear",
            "API": {
                "example": process.env.URL || "http://localhost:3000" + "/api/sorting/lessons/Science",
            }
        });

    }
    else if (!field) {
        res.send({
            "ERROR": "Sorting require field name. ",
            "Possible URL": "/api/sorting/lessons/subject/",
            "Possible URL": "/api/sorting/lessons/subject/1"
        });
    }
    else if (!ordering) {

        const coll_ = await coll.find({}).sort({ [field]: 1 }).toArray();

        res.send(coll_);

    }
    else if (ordering === "1") {

        const coll_ = await coll.find({}).sort({ [field]: 1 }).toArray();

        res.send(coll_);
    }
    else if (ordering === "-1") {

        const coll_ = await coll.find({}).sort({ [field]: -1 }).toArray();

        res.send(coll_);
    }

});


app.get("/api/find/:collection?/:value?", async function (req, res) {
    const { collection, value } = req.params;

    if (!collection) {
        res.send({
            "ERROR": "Its looklike you provide incomplete URL, while you are finding record you need to provide which keyword you are looking for inside collection",
            "API": {
                "example": process.env.URL || "http://localhost:3000" + "/api/find/lessons/Science",
            }
        });
    } else if (!value) {

        res.send({
            "ERROR": "Its look like you provide incomplete URL, while you are finding record you need to provide which keyword you are looking for inside collection",
            "API": {
                "example": process.env.URL || "http://localhost:3000" + "/api/find/lessons/English",
            }
        });

    }
    else {

        coll = db.collection(collection);

        const coll_obj = await coll.find({}).toArray();
        const coll_ = coll_obj.filter(doc => doc.subject.toLowerCase().includes(value.toLowerCase()));

        res.send(coll_);

    }

});

app.route("/api/:collection?/:id?").get(
    async function (req, res) {
        const { collection, id } = req.params;

        if (!collection) {

            res.send("Invalid Collection");

        } else {

            if (collection === 'find') {
                console.log({
                    "err": "Find is not collection. triggered from wrong place. If you see this message. need to resolve the request, which should not run from here",
                    "url": "/api/find/" + id
                });
            }

            const coll = db.collection(collection);

            // SEARCH BY ID
            if (!id) {
                const coll_ = await coll.find({}).toArray();
                res.send(coll_);
            } else {
                // SEARCH BY OBJECT ID
                if (id.length > 4) {

                    const ObjectId = require('mongodb').ObjectId;

                    try {
                        const mongo_object_id = new ObjectId(id);

                        const coll_ = await coll.find({ _id: mongo_object_id }).toArray();

                        res.send(coll_);

                    } catch (error) {
                        res.send("Invalid Request string");
                    }

                } else {
                    const coll_ = await coll.find({ id: parseInt(id) }).toArray();
                    res.send(coll_);
                }
            }
        }
    }
).post(
    async function (req, res, next) {

        const { collection } = req.params;

        let coll = db.collection(collection);

        const bodyobj = req.body;

        await coll.insertOne(bodyobj);

        res.send(bodyobj);
    }
).put(

    async function (req, res, next) {

        const { collection, id } = req.params;

        if (!collection) {

            res.send("Nothing to update! Invalid Collection");

        } else {

            if (!id) {

                res.send({ err: "Nothing to update! Invalid Collection" });

            } else {

                let coll = db.collection(collection);

                const bodyobj = req.body;

                // upldate by object id
                if (id.length > 4 && typeof id === 'string') {

                    const ObjectId = require('mongodb').ObjectId;
                    const mongo_object_id = new ObjectId(id);

                    await coll.updateOne({ _id: mongo_object_id }, { $set: bodyobj });

                } else {
                    // update by object id

                    await coll.updateOne({ id: parseInt(id) }, { $set: bodyobj });

                }

                res.send(bodyobj);
            }

        }
    }

).delete(

    async function (req, res) {

        const { resource, id } = req.params;

        const ObjectId = require('mongodb').ObjectId;
        const mongo_object_id = new ObjectId(id);

        let collection = db.collection(resource);

        if (id.length > 4 && typeof id === 'string') {

            await collection.deleteOne({ _id: mongo_object_id });

        } else {
            await collection.deleteOne({ id: parseInt(id) });
        }

        res.send({ id });

    }

);


const url = process.env.URL || "http://localhost:";
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("App is started on " + url + port);
});
