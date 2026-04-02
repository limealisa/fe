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
  listDeposit: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 1;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 20;

      const from = req.query.from ? `&from=${req.query.from}` : ``;
      const to = req.query.to ? `&to=${req.query.to}` : ``;

      const bankName = req.query.bankName
        ? `&bankName=${req.query.bankName}`
        : ``;
      const bankProvide = req.query.bankProvide
        ? `&bankProvide=${req.query.bankProvide}`
        : ``;
      const bankNumber = req.query.bankNumber
        ? `&bankNumber=${req.query.bankNumber}`
        : ``;
      const transId = req.query.transId ? `&transId=${req.query.transId}` : ``;
      const amount = req.query.amount ? `&amount=${req.query.amount}` : ``;
      const status = req.query.status ? `&status=${req.query.status}` : ``;

      const session = req.session;
      const dataPage = {
        config: config,
        title: "Danh Sách Yêu Cầu Nạp Tiền",
        session: session,
        helpers: helpers,
      };

      await axios({
        method: "get",
        url: `${config.API_SERVER}/deposit?page=${page}&limit=${kmess}${bankProvide}${bankName}${bankNumber}${transId}${amount}${status}${from}${to}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          if (Object.hasOwn(resApi, "code") && resApi.code == "permission_required") return res.redirect("/error/403");

          res.render("pages/deposit/listDeposit", {
            dataPage: dataPage,
            dataApi: resApi.data,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/deposit/listDeposit", {
            dataPage: dataPage,
            dataApi: [],
            error: err.msg,
          });
        });
    } catch (e) {
      console.log(e);
      res.redirect("/auth/login");
    }
  },
  Actions: {},
};
