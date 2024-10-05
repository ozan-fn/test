import mqtt from "mqtt";

const connectUrl = "wss://a93bb6a45b2d4a60bbf254a374d0e89f.s1.eu.hivemq.cloud:8884/mqtt";

const client = mqtt.connect(connectUrl, { username: "ozan6825", password: "Akhmad6825" });

client.on("connect", () => {
  console.log("Connected");
  client.subscribe(["ping/response", "sensor/soil_moisture"], (err) => {
    if (!err) {
      console.log("Subscribed to topic");
    }
  });
});

export default client;
