const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;

///

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.enpeg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("err", err);
  const productCollection = client.db("ecommerceStore").collection("products");
  const orderCollection = client.db("ecommerceStore").collection("userOrder");
  const adminCollection = client.db("ecommerceStore").collection("admin");
  console.log("database has been connected", productCollection);

  app.post("/addProduct", (req, res) => {
    const product = req.body;
    productCollection.insertMany(product).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/products", (req, res) => {
    const search = req.query.search;
    productCollection
      .find({ name: { $regex: search } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  app.get("/product/:key", (req, res) => {
    productCollection
      .find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.post("/productKeys", (req, res) => {
    const productKeys = req.body;
    productCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });

  ///order-section
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteOrder/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    orderCollection
      .findOneAndDelete({ _id: id })
      .then((err, documents) => res.send(documents));
  });

  app.patch("/update/:id", (req, res) => {
    orderCollection
      .updateOne(
        {
          _id: ObjectId(req.params.id),
        },
        {
          $set: { status: req.body.value },
        }
      )
      .then((result) => {
        res.send(result.modifiedCount > 0);
      });
  });
  ////delete order
  // app.delete("/deleteOrder/:id", (req, res) => {
  //   const id = ObjectId(req.params.id);
  //   orderCollection.findOneAndDelete({ _id: id }).then((err, documents) => {
  //     res.send(documents);
  //   });
  // });

  ///
  ///

  // app.get("/ownOrder", (req, res) => {
  //   orderCollection.find({ email: req.params.email }).toArray((err, items) => {
  //     res.send(items);
  //   });
  // });

  app.get("/ownOrder", (req, res) => {
    orderCollection.find({ email: req.query.email }).toArray((err, items) => {
      res.send(items);
    });
  });

  app.get("/userOrder", (req, res) => {
    orderCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  // ///admin-section
  // app.post("/isAdmin", (req, res) => {
  //   const email = req.body.email;
  //   adminCollection
  //     .find({ email: email })
  //     //
  //     .toArray((err, admins) => {
  //       res.send(admins.length > 0);
  //     });
  // });

  // app.post("/addAdmin", (req, res) => {
  //   const admin = req.body;
  //   adminCollection.insertOne(admin).then((result) => {
  //     res.send(result.insertedCount > 0);
  //   });
  // });

  // ///admin-list
  // app.get("/admin", (req, res) => {
  //   adminCollection.find().toArray((err, documents) => {
  //     res.send(documents);
  //   });
  // });

  // //admin-dashboard-activity

  // ///admin delete
  // app.delete("/removeAdmin/:id", (req, res) => {
  //   const id = ObjectId(req.params.id);
  //   adminCollection.findOneAndDelete({ _id: id }).then(err, (documents) => {
  //     res.send(documents);
  //   });
  // });
  //////////
  app.post("/addAdmin", (req, res) => {
    const admin = req.body;

    adminCollection.insertOne(admin).then((result) => {
      console.log("result", result);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/admin", (req, res) => {
    adminCollection.find().toArray((err, items) => {
      console.log("items", items);
      res.send(items);
    });
  });

  app.delete("/removeAdmin/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    adminCollection
      .findOneAndDelete({ _id: id })
      .then((err, documents) => res.send(documents));
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admins) => {
      res.send(admins.length > 0);
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello Riaz");
});

app.listen(port);
