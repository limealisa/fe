const qs = require("qs");
const axios = require("axios");
const config = require("@Config");
const helpers = require("@Helpers/helpers");
const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  SUCCESS,
} = require("@Helpers/contants");

module.exports = {
  launchGame: async (req, res) => {
    const session = req.session;
    const dataPage = {
      title: "Wait launching...",
      config,
      session,
      helpers,
      location: "launch-game",
    };

    try {
      const { id } = req.params;
      const { code, platform } = req.query;

      if (!id || !code) {
        return res
          .status(200)
          .json({ status: false, msg: "Error Missing Params!" });
      }

      await axios({
        method: "get",
        url: `${config.MAIN_API}/api/game/launchgame/${id.toUpperCase()}?code=${code}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          console.log(resApi);
          if (resApi.status) {
            res.render("pages/game/launchgame", {
              dataPage,
              dataApi: resApi.data,
              error: null,
            });
          } else {
            res.render("pages/game/launchgame", {
              dataPage,
              dataApi: null,
              error: resApi.msg,
            });
          }
        })
        .catch((err) => {
          console.log(err.message);
          res.render("pages/game/launchgame", {
            dataPage,
            dataApi: null,
            error: err.message,
          });
        });
    } catch (e) {
      console.log(e);
      res.render("pages/game/launchgame", {
        dataPage,
        dataApi: null,
        error: e.message,
      });
    }
  },
};
