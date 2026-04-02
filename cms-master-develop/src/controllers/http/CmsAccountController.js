const {
    ERROR_CUSTOM,
    ERROR_FORM,
    SUCCESS,
    ERROR_SERVER,
    ERROR_AGENT,
  } = require("@Helpers/contants");
  const axios = require("axios");
  const validator = require("validator");
  
  const config = require("@Config");
  const helpers = require("@Helpers/helpers");
  const { parseInt } = require("@Helpers/Number");
  
  module.exports = {
    listAccount: async (req, res) => {
      try {
        const session = req.session;
        const dataPage = {
          config: config,
          title: "Danh Sách Tài Khoản Quản Trị Viên",
          session: session,
          helpers: helpers,
        };
  
        await axios({
          method: "get",
          url: `${config.API_SERVER}/cms-account?page=1&limit=10000`,
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
          .then((resp) => {
            const resApi = resp.data;
  
            if (Object.hasOwn(resApi, "code") && resApi.code == "permission_required") return res.redirect("/error/403");
  
            res.render("pages/cms/listAccount", {
              dataPage: dataPage,
              dataApi: resApi.data,
              error: null,
            });
          })
          .catch((err) => {
            console.log(err);
            res.render("pages/cms/listAccount", {
              dataPage: dataPage,
              dataApi: [],
              error: err.msg,
            });
          });
      } catch (e) {
        console.log(e);
        res.redirect("/login");
      }
    },
    Actions: {},
  };
  