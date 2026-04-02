const { ERROR_PAGE } = require("@Helpers/contants");
const config = require("@Config");
const router = require("express").Router();
const helpers = require("@Helpers/helpers");
const middware = require("@Middwares/Authenticate");
const AuthRouter = require("@HttpRouters/AuthRouter");
//const AgentRouter = require("@HttpRouters/AgentRouter");
const UserRouter = require("@HttpRouters/UserRouter");
const AgencyRouter = require("@HttpRouters/AgencyRouter");
const BankDepositRouter = require("@HttpRouters/BankDepositRouter");
const DepositRouter = require("@HttpRouters/DepositRouter");
const DepositCardRouter = require("@HttpRouters/DepositCardRouter");
const WithdrawRouter = require("@HttpRouters/WithdrawRouter");
const MessageRouter = require("@HttpRouters/MessageRouter");
const AnnouncementRouter = require("@HttpRouters/AnnouncementRouter");
const GameRouter = require("@HttpRouters/GameRouter");
const SettingRouter = require("@HttpRouters/SettingRouter");
const SettingApiRouter = require("@HttpRouters/SettingApiRouter");
const PromotionRouter = require("@HttpRouters/PromotionRouter");
const CmsAccountRouter = require("@HttpRouters/CmsAccountRouter");
const ErrorRouter = require("@HttpRouters/ErrorRouter");

router.get("/", middware, (req, res) => {
  try {
    const session = req.session;
    const dataPage = {
      title: "Trang Tổng Quan",
      session,
      config,
      helpers: helpers,
    };
    res.render("pages/index", {
      dataPage: dataPage,
    });
  } catch (e) {
    res.status(500).json({
      status: false,
      msg: e.message,
    });
  }
});

router.use("/auth", AuthRouter);
router.use("/user", middware, UserRouter);
router.use("/agency", middware, AgencyRouter);
router.use("/bankDeposit", middware, BankDepositRouter);
router.use("/deposit", middware, DepositRouter);
router.use("/depositCard", middware, DepositCardRouter);
router.use("/withdraw", middware, WithdrawRouter);
router.use("/message", middware, MessageRouter);
router.use("/announcement", middware, AnnouncementRouter);
router.use("/game", middware, GameRouter);
router.use("/setting", middware, SettingRouter);
router.use("/setting-api", middware, SettingApiRouter);
router.use("/promotion", middware, PromotionRouter);
router.use("/cms-account", middware, CmsAccountRouter);

router.use("/error", ErrorRouter);

module.exports = router;
