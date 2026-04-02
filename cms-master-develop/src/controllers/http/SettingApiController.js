const {
    ERROR_CUSTOM,
    ERROR_FORM,
    SUCCESS,
    ERROR_SERVER,
    ERROR_AGENT,
} = require("@Helpers/contants");

const config = require("@Config");
const helpers = require("@Helpers/helpers");

module.exports = {
    ApiConfig: async (req, res) => {
        try {
            const session = req.session;
            const dataPage = {
                config: config,
                title: "Cấu hình API",
                session: session,
                helpers: helpers,
            };
            res.render("pages/setting-api/apiConfig", {
                dataPage: dataPage,
                dataApi: [],
                error: "error",
            });
        } catch (e) {
            console.log(e);
            res.redirect("/auth/login");
        }
    },
    ProductConfig: async (req, res) => {
        try {
            const session = req.session;
            const dataPage = {
                config: config,
                title: "Cấu hình nhà cung cấp trò chơi",
                session: session,
                helpers: helpers,
            };
            res.render("pages/setting-api/productConfig", {
                dataPage: dataPage,
                dataApi: [],
                error: "error",
            });
        } catch (e) {
            console.log(e);
            res.redirect("/auth/login");
        }
    },
    GameConfig: async (req, res) => {
        try {
            const session = req.session;
            const dataPage = {
                config: config,
                title: "Cấu hình sản phẩm trò chơi",
                session: session,
                helpers: helpers,
            };
            res.render("pages/setting-api/gameConfig", {
                dataPage: dataPage,
                dataApi: [],
                error: 'error',
            });
        } catch (e) {
            console.log(e);
            res.redirect("/auth/login");
        }
    },
};
