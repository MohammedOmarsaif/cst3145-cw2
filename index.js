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
    res.send("Welcome");
});

app.route("/api/:collection?/:opt?/:key?").get(
    async function (req, res) {
        const { collection, opt, key } = req.params;

        if (!collection) {

            res.send("Invalid Collection");

        } else if (!opt) {

            coll = db.collection(collection);
            const coll_obj = await coll.find({}).toArray();
            res.send(coll_obj);

        } else if (!key) {
            
            res.send("Collection: " + collection + " > Option: " + opt);
            

        }else{

            res.send("Collection: " + collection + " > Option: " + opt + " Key: "+ key);

        }
    }
).post(

).put(

).delete(

);



const url = process.env.URL || "http://localhost:";
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("App is started on " + url + port);
});
