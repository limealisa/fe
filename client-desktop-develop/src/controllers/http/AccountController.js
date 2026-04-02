const axios = require("axios");
const config = require("@Config");
const helpers = require("@Helpers/helpers");
const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  SUCCESS,
} = require("@Helpers/contants");
//const { createToken, verifyToken } = require('@Helpers/jwt');
//const { validatePassword } = require('@Helpers/AgentMaster/password');
const { parseInt } = require("@Helpers/Number");

module.exports = {
  profile: async (req, res) => {
    try {
      const dataPage = {
        title: "",
        config,
        session: req.session,
        helpers,
        location: "profile",
      };
      res.render("pages/account/profile", {
        dataPage,
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  deposit: async (req, res) => {
    try {
      const dataPage = {
        title: "",
        config,
        session: req.session,
        helpers,
        location: "deposit",
      };
      res.render("pages/account/deposit", {
        dataPage,
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  withdraw: async (req, res) => {
    try {
      const session = req.session;
      const dataPage = {
        title: "",
        config,
        session,
        helpers,
        location: "withdraw",
      };
      await axios({
        method: "get",
        url: `${config.MAIN_API}/api/payment/getListUserBank`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          res.render("pages/account/withdraw", {
            dataPage: dataPage,
            dataApi: resApi,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/account/withdraw", {
            dataPage: dataPage,
            error: err.msg,
          });
        });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  inbox: async (req, res) => {
    try {
      const dataPage = {
        title: "",
        config,
        session: req.session,
        helpers,
        location: "inbox",
      };
      res.render("pages/account/inbox", {
        dataPage,
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  transactionHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 1;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 10;

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
        title: "",
        session: session,
        helpers: helpers,
        location: "finan-history",
      };

      await axios({
        method: "get",
        url: `${config.MAIN_API}/api/payment/history?page=${page}&limit=${kmess}${bankProvide}${bankName}${bankNumber}${transId}${amount}${status}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          res.render("pages/account/transactionHistory", {
            dataPage: dataPage,
            dataApi: resApi.data,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/account/transactionHistory", {
            dataPage: dataPage,
            dataApi: [],
            error: err.msg,
          });
        });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  gameHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 1;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 10;

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
        title: "",
        session: session,
        helpers: helpers,
        location: "game-history",
      };

      await axios({
        method: "get",
        url: `${config.MAIN_API}/api/game/history?page=${page}&limit=${kmess}${bankProvide}${bankName}${bankNumber}${transId}${amount}${status}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          res.render("pages/account/gameHistory", {
            dataPage: dataPage,
            dataApi: resApi.data,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/account/gameHistory", {
            dataPage: dataPage,
            dataApi: [],
            error: err.msg,
          });
        });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  walletTransfer: async (req, res) => {
    try {
      const session = req.session;
      const dataPage = {
        config: config,
        title: "",
        session: session,
        helpers: helpers,
        location: "wallet-transfer",
      };
      res.render("pages/account/walletTransfer", {
        dataPage: dataPage,
        dataApi: [],
        error: null,
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  vipInfo: async (req, res) => {
    try {
      const session = req.session;
      const dataPage = {
        config: config,
        title: "",
        session: session,
        helpers: helpers,
        location: "vip",
      };
      res.render("pages/account/vip", {
        dataPage: dataPage,
        dataApi: [],
        error: null,
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  agency: async (req, res) => {
    try {
      const session = req.session;
      const dataPage = {
        config: config,
        title: "",
        session: session,
        helpers: helpers,
        location: "agency",
      };
      res.render("pages/account/agency", {
        dataPage: dataPage,
        dataApi: [],
        error: null,
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },
  betRefurn: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 1;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 1000;

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
        title: "",
        session: session,
        helpers: helpers,
        location: "refurn-history",
      };

      await axios({
        method: "get",
        url: `${config.MAIN_API}/api/game/bet-refurn?page=${page}&limit=${kmess}${bankProvide}${bankName}${bankNumber}${transId}${amount}${status}`,
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((resp) => {
          const resApi = resp.data;
          // console.log(resApi.data.dataExport);
          res.render("pages/account/refurnHistory", {
            dataPage: dataPage,
            dataApi: resApi.data,
            error: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("pages/account/refurnHistory", {
            dataPage: dataPage,
            dataApi: [],
            error: err.msg,
          });
        });
    } catch (e) {
      res.status(200).json({
        status: false,
        msg: e.message,
      });
    }
  },

};
