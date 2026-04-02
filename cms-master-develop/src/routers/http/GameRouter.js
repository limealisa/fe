const { ERROR_PAGE } = require("@Helpers/contants");
const config = require("@Config");
const router = require("express").Router();
const GameController = require("@HttpControllers/GameController");

router.get("/bet-history", (req, res) => {
  GameController.listBetHistory(req, res);
});

router.get("/bet-history/:id", (req, res) => {
  GameController.listBetHistoryByUser(req, res);
});

router.get("/bet-return", (req, res) => {
  GameController.listBetReturnHistory(req, res);
});

// other game
router.get("/baccarat", (req, res) => {
  GameController.Baccarat(req, res);
});

router.get("/baccarat-stream", (req, res) => {
  GameController.BaccaratStream(req, res);
});

router.get("/baccarat-get-stream", (req, res) => {
  GameController.BaccaratGetLiveStream(req, res);
});

// other game
router.get("/xocdia", (req, res) => {
  GameController.Xocdia(req, res);
});

router.get("/xocdia-stream", (req, res) => {
  GameController.XocdiaStream(req, res);
});

router.get("/xocdia-get-stream", (req, res) => {
  GameController.XocdiaGetLiveStream(req, res);
});

// mini Tài Xỉu
router.get("/mini-taixiu", (req, res) => {
  GameController.MiniTaiXiu(req, res);
});

// mini Xóc Đĩa
router.get("/mini-xocdia", (req, res) => {
  GameController.MiniXocDia(req, res);
});

router.get("/mini-taixiu/user-history/:id", (req, res) => {
  GameController.MiniTaiXiu_UserHistory(req, res);
});

router.get("/mini-xocdia/user-history/:id", (req, res) => {
  GameController.MiniXocDia_UserHistory(req, res);
});

module.exports = router;
