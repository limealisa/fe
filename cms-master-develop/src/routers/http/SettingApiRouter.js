const { ERROR_PAGE } = require("@Helpers/contants");
const config = require("@Config");
const router = require("express").Router();
const SettingApiController = require("@HttpControllers/SettingApiController");

router.get("/api-config", (req, res) => {
    SettingApiController.ApiConfig(req, res);
});

router.get("/product-config", (req, res) => {
    SettingApiController.ProductConfig(req, res);
});

router.get("/game-config", (req, res) => {
    SettingApiController.GameConfig(req, res);
});

module.exports = router;
