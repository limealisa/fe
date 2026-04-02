const { ERROR_PAGE } = require("@Helpers/contants");
const router = require("express").Router();

router.get("/403", (req, res) => {
    return res.render("pages/error/403");
});

module.exports = router;
