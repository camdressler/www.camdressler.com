const Discord = require("discord.js");
const time = require("node-get-time");
const MongoClient = require("mongodb").MongoClient;

const bot = new Discord.Client();

const uri =
  "mongodb+srv://rageaiotechnologies:LinkedCamRageBMOriginVariant!@checkout-log.v9moq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

let client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let updatedResponse = { alerts: [] };

async function getNewRestocks() {
  let response = [];
  let data = null;

  client.connect(async (err) => {
    let waitedArray = client
      .db("checkouts")
      .collection("logs")
      .find()
      .sort({ $natural: -1 })
      .limit(10)
      .toArray();

    data = await waitedArray;

    data.forEach(async (entry) => {
      const parsedDatabaseEntryTimestamp = entry.timestamp.split(" ");
      const databaseEntryTimestampObject = {
        date: parsedDatabaseEntryTimestamp[0],
        time: parsedDatabaseEntryTimestamp[1],
      };
      const localTimestamp = await getTimestamp();
      const parsedLocalTimestamp = localTimestamp.split(" ");
      const localTimestampObject = {
        date: parsedLocalTimestamp[0],
        time: parsedLocalTimestamp[1],
      };

      if (localTimestampObject.date === databaseEntryTimestampObject.date) {
        const localTimestampTimeParsed = localTimestampObject.time.split(":");
        const databaseEntryTimestampTimeParsed = databaseEntryTimestampObject.time.split(
          ":"
        );

        if (
          localTimestampTimeParsed[0] === databaseEntryTimestampTimeParsed[0]
        ) {
          console.log("passed hourly check");
          console.log(localTimestampTimeParsed);
          console.log(databaseEntryTimestampTimeParsed);

          let timeDifference =
            localTimestampTimeParsed[1] - databaseEntryTimestampTimeParsed[1];

          if (timeDifference <= 5) {
            console.log(entry);
            addToSite(entry);
          }
        } else {
          let sumOfLocalTime = Number(
            `${localTimestampTimeParsed[0]}${localTimestampTimeParsed[1]}`
          );
          let sumOfDatabaseTime = Number(
            `${databaseEntryTimestampTimeParsed[0]}${databaseEntryTimestampTimeParsed[1]}`
          );
          if (sumOfLocalTime - sumOfDatabaseTime <= 45) {
            console.log("Passed cross hourly check");
            console.log(entry);
            response.push(entry);
          }
        }
      }
    });

    console.log(`${response.length} restocks found!`);

    updatedResponse.alerts = response;
  });
}

async function addToSite(entry) {
  updatedResponse.alerts.push(entry);

  setTimeout(() => {
    const index = updatedResponse.alerts.indexOf(entry);
    if (index >= 0) {
      updatedResponse.alerts.splice(index, 1);
    }
  }, 60000);
}

async function getTimestamp() {
  let t = null;
  time.gettime(function (time) {
    t = time.dateTime;
  });
  return t;
}

bot.on("ready", () => {
  console.log(`Monitor Online`);
});

bot.on("message", async (message) => {
  if (message.channel.id === "828714490257735720") {
    let fields = message.embeds[0].fields;

    let site = fields[0].value;
    let sku = fields[1].value;

    site = site.replace("**```", "");
    sku = sku.replace("**```", "");

    site = site.replace("```**", "");
    sku = sku.replace("```**", "");

    let obj = {
      site: site,
      sku: sku,
    };

    let timestamp = await getTimestamp();

    createListing({
      site: site,
      sku: sku,
      timestamp: timestamp,
    });
  }
});

async function createListing(newListing) {
  try {
    client.db("checkouts").collection("logs").insertOne(newListing);
  } catch (err) {
    console.log(err);
  }
}

bot.login("NjUzMTY2Mjk3NTkyNjI3MjAx.XezChA._QANQcpqVYx-xgtGPk8xq-EePzY");

module.exports = { updatedResponse, getNewRestocks };
