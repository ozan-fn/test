import express from "express";
import cors from "cors";
import path from "path";

const app = express();

// app.use(helmet());
app.use(cors());

app.use(express.static(path.join(__dirname, "../../dist")));

// app.get("/api", (req, res) => {
//   try {
//     const v = req.query.v;
//     if (!v) {
//       res.sendStatus(400);
//       return;
//     }
//     const channel = ably.channels.get("test");
//     channel.publish("v", v);
//     res.sendStatus(200);
//   } catch {
//     res.sendStatus(500);
//   }
// });

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
