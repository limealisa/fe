const { ERROR_PAGE } = require("@Helpers/contants");
const config = require("@Config");
const router = require("express").Router();
const _Controller = require("@HttpControllers/CmsAccountController");

router.get("/", (req, res) => {
    _Controller.listAccount(req, res);
});

module.exports = router;
