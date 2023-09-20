const app = require('express')();
const {Client} = require("pg");
const crypto = require("crypto");
const HashRing = require("hashring");
const hashRing = new HashRing();
const{log,error,warn} = require("./them-warrper");
const axios = require('axios');

hashRing.add("5433");
hashRing.add("5434");
hashRing.add("5435");

const clients = {
    "5433" : new Client ({
        "host": "localhost",
        "port": "5433",
        "user": "osama",
        "password": "123456",
        "database": "osama"
    }),
    "5434" : new Client ({
        "host": "localhost",
        "port": "5434",
        "user": "osama",
        "password": "123456",
        "database": "osama"
    }),
    "5435" : new Client ({
        "host": "localhost",
        "port": "5435",
        "user": "osama",
        "password": "123456",
        "database": "osama"
    })
};

(async ()=>{
   await connectToDb();
})();

async function connectToDb() {
    for(const port in clients) {
        try{
            await clients[port].connect();
            console.log("db connected successfully".green);
        }catch (err) {
            console.error("error on connecting to db ".red,);
        }
    }
};

app.get("/:urlId", async (req, res) => {
    //https://localhost:8081/fhy2h
    const urlId = req.params.urlId; //fhy2h
    const server = hashRing.get(urlId);

    const result = await clients[server].query("SELECT * FROM URL_TABLE WHERE URL_ID = $1", [urlId]);

    if (result.rowCount > 0) {
        res.status(200).json({
            "urlId": urlId,
            "url": result.rows[0],
            "server": server
        })
    }
    else
        res.status(404).json({
           "error":"not found"
        });

});

app.post("/", async (req, res) => {

    const url = req.query.url;
    //www.wikipedia.com/sharding
    //consistently hash this to get a port!
    const hash = crypto.createHash("sha256").update(url).digest("base64").toString();
    const urlId = hash.slice(0, 5);

    const server = hashRing.get(urlId);

    await clients[server].query("INSERT INTO URL_TABLE (URL, URL_ID) VALUES ($1,$2)", [url, urlId]);

    res.status(200).json({
        "urlId": urlId,
        "url": url,
        "server": server
    });
});


// async function sendBatchOfRequests(startIndex, batchSize) {
//     const url = "www.wikipedia.com/";
//     const requests = [];
//
//     for (let i = startIndex; i < startIndex + batchSize; i++) {
//         const rand = crypto.createHash("sha256")
//             .update(`seed-${i}`)
//             .digest("hex")
//             .slice(0, 6);
//
//         const requestPromise = axios.post("http://localhost:8081?url=" + url + rand);
//         requests.push(requestPromise);
//     }
//
//     return Promise.all(requests);
// }


async function getShardsTableLengths() {
    for(const port in clients) {
        try{
          const length =  await clients[port].query("SELECT COUNT(*) FROM URL_TABLE;");
            console.log("SHARD: ",port," , with table length: ",length.rows[0].count);
        }catch (err) {
            console.error("error on fetching table lengths  ".red,);
        }
    }
};
(async ()=>{
    await getShardsTableLengths();
})();

const PORT = 8081;
app.listen(PORT,()=>{
    console.log(`app start listing to port ${PORT} `);
});