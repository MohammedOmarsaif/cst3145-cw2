var express = require("express");
const cors = require("cors");
const morgan = require("morgan");
var path = require("path");
var filesys = require("fs");

const logsPath = path.join(__dirname, 'logs');
if (!filesys.existsSync(logsPath)) {
filesys.mkdirSync(logsPath);
}
const logsReq = filesys.createWriteStream(path.join(logsPath, 'logs'), { flags: 'a' });

app.use( morgan( 'combined' , { stream: logsReq }) );


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

let app = express();

var staticFolder = path.resolve(__dirname, "public");
app.use("/public", express.static(staticFolder));

app.set('json spaces', 2);
app.use(cors());
app.use(express.json());
app.use(morgan("short"));



app.get("/",function(req, res){
    res.send("Welcome");
});

app.route("/api/:collection?/:opt?/:param?").get(
    async function(req,res){
        const { collection, opt, param} = req.params;

        if(!collection){
            
            res.send("NOT VALID collection");
        
        } else if(!opt){

            res.send("Collection: " + collection);
        
        } else if(!param){

            res.send("Collection: " + collection + " > Option: " + collection);
        
        }
    }
).post(

).put(

).delete(

);



const url = process.env.URL || "http://localhost:";
const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("App is started on "+ url + port);
});
