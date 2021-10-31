const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());
require("dotenv").config();
const objectId = require("mongodb").ObjectId;
console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ngucd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("goerTravel");
    const servicessCollections = database.collection("services");
    const ordersCollections = database.collection("orders");
    // get all service value from database
    app.get("/addService", async (req, res) => {
      const cursor = servicessCollections.find({});
      const services = await cursor.toArray();
      res.json(services);
    });
    //  get all order value
    app.get("/order/", async (req, res) => {
      const cursorOrder = ordersCollections.find({});
      const orders = await cursorOrder.toArray();
      res.json(orders);
    });

    // get single order value from database
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const order = await ordersCollections.findOne(query);
      console.log("load user with id:", id);
      res.send(order);
    });

    // create a addService document to insert in database
    app.post("/addService/", async function (req, res) {
      const newUser = req.body;
      const result = await servicessCollections.insertOne(newUser);
      console.log("got new User", req.body);
      console.log("added User", result);
      res.send(result);
    });
    // create a order document to insert in database
    app.post("/order/", async function (req, res) {
      const newOrder = req.body;
      const resultOrder = await ordersCollections.insertOne(newOrder);
      console.log("got new Order", req.body);
      console.log("added Order", resultOrder);
      res.send(resultOrder);
    });
    // delete order api
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: objectId(id) };
      const resultOrder = await ordersCollections.deleteOne(query);
      console.log("deleting user with id", resultOrder);
      res.json(resultOrder);
    });

    //UPDATE order API
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: objectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const resultOrder = await ordersCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(resultOrder);
    });

    // const doc = {
    //   title: "Record of a Shriveled Datum",
    //   content: "No bytes, no problem. Just insert a document, in MongoDB",
    // };
    // const result = await usersCollections.insertOne(doc);
    // console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running my Goer Travel server");
});
app.listen(port, () => {
  console.log("Running my Goer Travel server", port);
});
