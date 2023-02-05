var express = require("express");
const cors = require("cors");
const morgan = require("morgan");
var path = require("path");
var fs = require("fs");

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

            res.send("Option: " + collection);
        
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
