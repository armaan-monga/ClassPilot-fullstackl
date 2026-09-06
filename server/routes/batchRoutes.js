const express = require("express");
const router = express.Router();
const {
  getBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
} = require("../controllers/batchController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getBatches).post(createBatch);
router.route("/:id").get(getBatch).put(updateBatch).delete(deleteBatch);

module.exports = router;
