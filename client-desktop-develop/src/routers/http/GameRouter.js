const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const middware = require("@Middwares/Authenticate");
const middware2 = require("@Middwares/BalanceUpdate");
const GameController = require("@HttpControllers/GameController");

router.get("/launchgame/:id", middware, (req, res) => {
  GameController.launchGame(req, res);
});

module.exports = router;
