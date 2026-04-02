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
  listUser: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 1;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 100;

      const name = req.query.name ? `&name=${req.query.name}` : ``;
      const username = req.query.username
        ? `&username=${req.query.username}`
        : ``;
      const phone = req.query.phone ? `&phone=${req.query.phone}` : ``;
      const email = req.query.email ? `&email=${req.query.email}` : ``;

      const session = req.session;
      const dataPage = {
        config: config,
        title: "Danh Sách Người Chơi",
        session: session,
        helpers: helpers,
      };

      await axios({
        method: "get",
        url: `${config.API_SERVER}/user?page=${page}&limit=${kmess}${name}${username}${phone}${email}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          // console.log(resApi.data.dataExport);

          if (Object.hasOwn(resApi, "code") && resApi.code == "permission_required") return res.redirect("/error/403");

          return res.render("pages/user/listUser", {
            dataPage: dataPage,
            dataApi: resApi.data,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/user/listUser", {
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
  BalanceFluction: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(200).json({
          status: false,
          msg: "Missing Param ID"
        });
      }

      if (!Number(id) >> 0) {
        return res.status(200).json({
          status: false,
          msg: "Err ID"
        });
      }

      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 1;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 50;

      const from = req.query.from ? `&from=${req.query.from}` : ``;
      const to = req.query.to ? `&to=${req.query.to}` : ``;

      const type = req.query.type ? `&type=${req.query.type}` : ``;
      const action = req.query.action
        ? `&action=${req.query.action}`
        : ``;
      const amount = req.query.amount ? `&amount=${req.query.amount}` : ``;
      const note = req.query.note ? `&email=${req.query.note}` : ``;

      const session = req.session;
      const dataPage = {
        req: req,
        config: config,
        title: "Biến động số dư người chơi",
        session: session,
        helpers: helpers,
      };

      await axios({
        method: "get",
        url: `${config.API_SERVER}/user/balance-fluct/${id}?page=${page}&limit=${kmess}${type}${action}${amount}${note}${from}${to}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          if (Object.hasOwn(resApi, "code") && resApi.code == "permission_required") return res.redirect("/error/403");

          res.render("pages/user/balanceFluct", {
            dataPage: dataPage,
            dataApi: resApi.data,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/user/balanceFluct", {
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
