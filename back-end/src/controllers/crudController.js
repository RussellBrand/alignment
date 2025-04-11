module.exports = {
  create: (Model) => async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  readAll: (Model) => async (req, res) => {
    try {
      const items = await Model.find();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  readOne: (Model) => async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      item ? res.json(item) : res.status(404).json({ error: "Not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: (Model) => async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      item ? res.json(item) : res.status(404).json({ error: "Not found" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: (Model) => async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      item
        ? res.json({ message: "Deleted successfully" })
        : res.status(404).json({ error: "Not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
