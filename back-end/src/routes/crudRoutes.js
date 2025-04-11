const express = require("express");
const controller = require("../controllers/crudController");
const validate = require("../middlewares/validate");
const schemas = require("../schemas");

module.exports = (Model, schema) => {
  const router = express.Router();

  router.post("/", validate(schema), controller.create(Model));
  router.get("/", controller.readAll(Model));
  router.get("/:id", controller.readOne(Model));
  router.put("/:id", validate(schema), controller.update(Model));
  router.delete("/:id", controller.delete(Model));

  return router;
};
