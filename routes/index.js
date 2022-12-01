const express = require("express");
const controllers = require("../controllers");
const router = express.Router();

router.route("/heading")
  .get(controllers.getAllHeading)
  .post(controllers.searchHeading);

router.route("/add-scheduled")
  .post(controllers.addScheduled);

router.route("/update-scheduled")
  .post(controllers.updateScheduled);

router.route("/delete-scheduled")
  .post(controllers.deleteScheduled);

router.route("/department")
  .get(controllers.getDepartment)
  .post(controllers.searchDepartment);

router.route('/detail')
  .post(controllers.getDetail)

module.exports = router;