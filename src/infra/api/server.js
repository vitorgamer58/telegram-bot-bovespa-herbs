// ts-check
const express = require("express");
const { Express } = require("express");
const { herbsshelf } = require("@herbsjs/herbsshelf");
const { herbarium } = require("@herbsjs/herbarium");

/**
 * @param {Express} app
 */
const shelf = (app) => {
  app.get("/herbsshelf", (_, res) => {
    res.setHeader("Content-Type", "text/html");

    const shelf = herbsshelf({ project: "telegram-bot-herbs", herbarium });

    res.write(shelf);
    res.send();
  });

  app.get("/", (req, res) => res.status(301).redirect("/herbsshelf"));

  console.info(`\n🌿 Herbs Shelf endpoint - /herbsshelf \n`);
};

const start = () => {
  herbarium.requireAll();

  const app = express();
  shelf(app);

  return app.listen({ port: 8080 }, () =>
    console.log(`🚀 Server UP and 🌪️  - http://localhost:8080/`)
  );
};

module.exports = { start };
