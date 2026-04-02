const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();
const MainRouter = require("@HttpRouters/MainRouter");
const AuthRouter = require("@HttpRouters/AuthRouter");
const AccountRouter = require("@HttpRouters/AccountRouter");
const GameRouter = require("@HttpRouters/GameRouter");
const GameLobbyRouter = require("@HttpRouters/GameLobbyRouter");
const VipRouter = require("@HttpRouters/VipRouter");
const PromotionRouter = require("@HttpRouters/PromotionRouter");

router.use("/", MainRouter);
router.use("/auth", AuthRouter);
router.use("/account", AccountRouter);
router.use("/game", GameRouter);
router.use("/gamelobby", GameLobbyRouter);
router.use("/vip-privileges", VipRouter);
router.use("/promotions", PromotionRouter);

module.exports = router;
