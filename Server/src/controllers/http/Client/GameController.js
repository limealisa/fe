const {
  ERROR_PAGE,
  ERROR_FORM,
  ERROR_AUTH,
  ERROR_AUTH_MESSAGE,
  ERROR_MESSAGES
} = require("@Helpers/contants");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
const Helper = require("@Helpers/helpers");
const { parseInt } = require("@Helpers/Number");
const config = require("@Config");
const TcgService = require("@Plugins/TcgService");
const { BetHistoryModel } = require("@Models/Bet/BetHistory");
const { BetRefurnModel } = require("@Models/Bet/BetRefurn");

const { findByID, findByUsername, UserModel } = require("@Models/User/User");
const BalanceFluct = require("@Models/User/BalanceFluct");

const { ApiConfigModel } = require("@Models/GameApi/ApiConfig");
const { ApiProductConfigModel } = require("@Models/GameApi/ApiProductConfig");
const { ApiGameConfigModel } = require("@Models/GameApi/ApiGameConfig");


module.exports = {
  subnames: async (req, res) => {
    try {
      const listProduct = await ApiProductConfigModel.getAllProductCode();
      res.status(200).json({
        status: true,
        data: listProduct.sort(),
        msg: "success",
        code: 200
      });
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  gameAvalible: async (req, res) => {
    try {
      const listProduct = await ApiProductConfigModel.findAll({
        attributes: { exclude: ["id", "createdAt", "deletedAt", "updatedAt"] }
      });
      let productAvailible = {};
      listProduct.forEach(product => {
        productAvailible[product.product_code] = {};
        productAvailible[product.product_code] = { ...product.dataValues };
        productAvailible[product.product_code].type = product.product_type;
        productAvailible[product.product_code].name = product.product_name;
        productAvailible[product.product_code].mode = product.product_mode;
      });
      res.status(200).json({
        status: true,
        data: productAvailible,
        msg: "success",
        code: 200
      });
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  launchGame: async (req, res) => {
    try {
      const { code, platform } = req.query;

      if (!code) return res
        .status(200)
        .json({ status: false, msg: "Error Missing Params!" });

      const getGameConfig = await ApiGameConfigModel.getGameByCode(code);
      if (!getGameConfig) return res
        .status(200)
        .json({ status: false, msg: "Không tìm thấy trò chơi này trên hệ thống!" });

      const getProduct = await ApiProductConfigModel.getProductByType(getGameConfig.product_type);
      if (!getProduct) return res
        .status(200)
        .json({ status: false, msg: "Không tìm thấy nhà cung cấp cho trò chơi này!" });

      const getApiConfig = await ApiConfigModel.getApiConfigByName(getProduct.product_api);
      if (!getApiConfig) return res
        .status(200)
        .json({ status: false, msg: "Không tìm cấu hình API cho nhà cung cấp này!" });

      let getGame = null;
      let platformClient = platform == "mobile" ? "html5" : "html5-desktop";
      let platformClientLottery = platform == "mobile" ? "MOBILE" : "WEB";
      let backUrl = platform == "mobile" ? `https://m.${config.SITE_DOMAIN}` : `https://www.${config.SITE_DOMAIN}`;

      if (getGameConfig.game_type == ApiGameConfigModel.GAME_TYPE.ELOTTO) { // xoso
        // get play game data
        let getLaunchGameParams = {
          username: req.user.username,
          product_type: getProduct.product_type,
          game_mode: "1",
          game_code: "lobby",
          lottery_bet_mode: "Elott",
          view: "lobby",
          language: "VI",
          back_url: backUrl,
          platform: platformClientLottery,
          method: 'lg',
        };
        const tcgService = new TcgService(getApiConfig.api_config);
        getGame = await tcgService.postAPI(getLaunchGameParams);
      } else {
        const tcgService = new TcgService(getApiConfig.api_config);
        getGame = await tcgService.getLaunchGame(
          req.user.username,
          getProduct.product_type,
          getProduct.product_mode,
          getGameConfig.game_code,
          platformClient
        );
      }

      if (getGame) {
        if (getGame.status == 0) {
          // update game play count
          try {
            getGameConfig.play_count += 1;
            getGameConfig.save();
            getGameConfig.reload();
          } catch (e) { }

          let playUrl = getGameConfig.game_type == ApiGameConfigModel.GAME_TYPE.ELOTTO ? `https://lottery.${config.SITE_DOMAIN}/${getGame.game_url}` : getGame.game_url;
          return res.status(200).json({
            status: true,
            data: { playUrl },
            msg: "success",
            code: 200
          });
        } else {
          return res.status(200).json({
            status: false,
            msg: getGame.error_desc,
            code: 3812,
            detail: getGame
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: `Khởi chạy trò chơi thất bại!`,
          code: 49532,
          detail: "Error Get Launcher"
        });
      }

    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        msg: e.message,
        code: "err_exception"
      });
    }
  },
  wallets: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res
        .status(200)
        .json({ status: false, msg: "Error Missing Param ID!" });

      if (id == "SITEWALLET") return res.status(200).json({
        status: true,
        balance: req.user.coin,
        msg: "success",
        code: 200
      });

      const listProductCode = await ApiProductConfigModel.getAllProductCode();

      if (!listProductCode.includes(id)) return res
        .status(200)
        .json({ status: false, msg: "Error Param ID Not Accept!" });

      const getProductConfig = await ApiProductConfigModel.getProductByCode(id);
      if (!getProductConfig) return res.status(200).json({
        status: false,
        msg: `Không tìm thấy Product Code này!`,
        code: 404
      });

      const getApiConfig = await ApiConfigModel.getApiConfigByName(getProductConfig.product_api);
      if (!getApiConfig) return res.status(200).json({
        status: false,
        msg: `Không tìm thấy Cấu hình Api cho Product Code này!`,
        code: 404
      });

      const tcgService = new TcgService(getApiConfig.api_config);

      const getBalance = await tcgService.getBalance(
        req.user.username,
        getProductConfig.product_type
      );

      if (getBalance) {
        if (getBalance.status == 0) {
          res.status(200).json({
            status: true,
            balance: getBalance.balance,
            msg: "success",
            code: 200
          });
        } else {
          res.status(200).json({
            status: false,
            msg: getBalance.error_desc,
            code: 500
          });
          return;
        }
      } else {
        res.status(200).json({
          status: false,
          msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
          code: 500
        });
        return;
      }
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  history: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        match.uid = req.user.id;
        const from = (req.query.from) ? req.query.from : moment().startOf("year").format("DD/MM/YYYY");
        const to = (req.query.to) ? req.query.to : moment().format("DD/MM/YYYY");
        match.createdAt = {
          [Op.between]: [moment(from, "DD/MM/YYYY").startOf("days").format(), moment(to, "DD/MM/YYYY").endOf("days").format()]
        };

        // filter
        if (!!req.query.gameCategory) {
          match.gameCategory = req.query.gameCategory;
        }

        const total = await BetHistoryModel.count({ where: match });
        const getData = await BetHistoryModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["betTime", "DESC"]],
          attributes: { exclude: ["deletedAt"] }
        });

        res.status(200).json({
          status: true,
          data: {
            dataExport: getData,
            page: page,
            kmess: kmess,
            total: total
          },
          msg: "SUCCESS"
        });
      } else {
        res.status(200).json({
          status: false,
          msg: ERROR_FORM.MISSING_FIELD
        });
      }
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  betRefurn: async (req, res) => {
    try {
      const page = parseInt(req.query.page, true)
        ? parseInt(req.query.page, true)
        : 0;
      const kmess = parseInt(req.query.limit, true)
        ? parseInt(req.query.limit, true)
        : 0;

      if (!!page && !!kmess) {
        let match = {};
        match.uid = req.user.id;
        const from = (req.query.from) ? req.query.from : moment().startOf("year").format("DD/MM/YYYY");
        const to = (req.query.to) ? req.query.to : moment().format("DD/MM/YYYY");
        match.createdAt = {
          [Op.between]: [moment(from, "DD/MM/YYYY").startOf("days").format(), moment(to, "DD/MM/YYYY").endOf("days").format()]
        };

        // filter
        if (!!req.query.gameCategory) {
          match.gameCategory = req.query.gameCategory;
        }

        const total = await BetRefurnModel.count({ where: match });
        const getData = await BetRefurnModel.findAll({
          where: match,
          offset: 0 + (page - 1) * kmess,
          limit: kmess,
          order: [["createdAt", "DESC"]],
          attributes: { exclude: ["deletedAt"] }
        });

        res.status(200).json({
          status: true,
          data: {
            dataExport: getData,
            page: page,
            kmess: kmess,
            total: total
          },
          msg: "SUCCESS"
        });
      } else {
        res.status(200).json({
          status: false,
          msg: ERROR_FORM.MISSING_FIELD
        });
      }
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  returnPointAllToProvider: async (req, res) => {
    try {
      const listProductCode = await ApiProductConfigModel.getAllProductCode();

      let listPromise = [];
      for (const productCode of listProductCode) {
        const getProductConfig = await ApiProductConfigModel.getProductByCode(productCode);
        if (!getProductConfig) continue;
        const getApiConfig = await ApiConfigModel.getApiConfigByName(getProductConfig.product_api);
        if (!getApiConfig) continue;

        const tcgService = new TcgService(getApiConfig.api_config);
        listPromise.push(await tcgService.userFullTransfer(
          req.user.username,
          getProductConfig.product_type,
          Helper.randomInteger(100000000000, 999999999999) // transID
        ));
      }

      let totalPoint = 0;
      const listPromiseGetBalance = await Promise.allSettled(listPromise);
      for (const provideBalance of listPromiseGetBalance) {
        if (provideBalance.status == "fulfilled") {
          const getBalance = provideBalance.value;
          if (getBalance) {
            if (getBalance.status == 0) {
              totalPoint += getBalance.amount;
            }
          }
        }
      }
      const amountUpdate = Math.floor(Number(totalPoint) * 1000);
      const user = await findByID(req.user.id);
      if (!!user) {
        user.coin += amountUpdate;
        await user.save();
        await user.reload();

        // create balance fluctuation
        await BalanceFluct.createBalaceFluct(
          user.id,
          BalanceFluct.BalanceFluctModel.ACTION_ENUM.TRANSFER_WALLET,
          BalanceFluct.BalanceFluctModel.TYPE_ENUM.PLUS,
          Number(amountUpdate),
          user.coin,
          `Thu hồi ${Helper.numberWithCommas(totalPoint)} điểm về tài khoản chính - cộng ${Helper.numberWithCommas(amountUpdate)}`
        );

        return res.status(200).json({
          status: true,
          balanceReturn: amountUpdate,
          msg: "success",
          code: 200
        });
      } else {
        return res.status(200).json({
          status: false,
          balanceReturn: 0,
          msg: "Không tìm thấy người dùng!",
          code: 200
        });
      }

    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },
  walletTransfer: async (req, res) => {
    try {
      // const { amount, type, transferType, password } = req.body;
      // if (!amount || !type || !transferType || !password) {
      //   return res
      //     .status(200)
      //     .json({ status: false, msg: "Error Missing Param!" });
      // }

      // // Check Password 
      // const currentMd5Pass = await UserModel.findOne({ where: { id: req.user.id }, attributes: ["password"] });
      // if (!validatePassword(password, currentMd5Pass.password)) {
      //   return res.status(200).json({
      //     status: false,
      //     msg: ERROR_AUTH.PASSWORD_INVALID,
      //     code: 1
      //   });
      // }

      const { amount, type, transferType } = req.body;
      if (!amount || !type || !transferType) return res
        .status(200)
        .json({ status: false, msg: "Error Missing Param!" });

      const getProductConfig = await ApiProductConfigModel.getProductByType(String(type));
      if (!getProductConfig) return res.status(200).json({
        status: false,
        msg: `Không tìm thấy Product Code này!`,
        code: 404
      });
      const getApiConfig = await ApiConfigModel.getApiConfigByName(getProductConfig.product_api);
      if (!getApiConfig) return res.status(200).json({
        status: false,
        msg: `Không tìm thấy Cấu hình Api cho Product Code này!`,
        code: 404
      });

      if (Number(transferType) == 1) { // Chuyển qũy sang sảnh

        const amountOk = Helper.roundDownToThousand(Number(amount)); // số tiền làm tròn xuống là bội của 1000 96 000
        const amountCancel = Number(amount) - amountOk; // số tiền trả lại khách 400

        const user = await findByID(req.user.id);
        if (user.coin < amountOk) return res
          .status(200)
          .json({ status: false, msg: "Số dư của bạn không đủ!" });

        const amountTransfer = amountOk / 1000;

        const tcgService = new TcgService(getApiConfig.api_config);

        const transfer = await tcgService.userTransfer(
          user.username,
          getProductConfig.product_type,
          1,
          amountTransfer,
          Helper.randomInteger(100000000000, 999999999999) // transID
        );

        if (transfer) {
          if (transfer.status == 0) {
            user.coin -= amountOk;
            await user.save();
            await user.reload();

            // create balance fluctuation
            await BalanceFluct.createBalaceFluct(
              user.id,
              BalanceFluct.BalanceFluctModel.ACTION_ENUM.TRANSFER_WALLET,
              BalanceFluct.BalanceFluctModel.TYPE_ENUM.MINUS,
              amountOk,
              user.coin,
              `Nạp ${Helper.numberWithCommas(amountTransfer)} điểm vào ${getProductConfig.product_code} - trừ ${Helper.numberWithCommas(amountOk)}`
            );

            return res
              .status(200)
              .json({ status: true, user, msg: "Chuyển quỹ thành công!" });
          } else {
            console.log("Nạp Responsive : " + JSON.stringify(transfer));
            return res.status(200).json({
              status: false,
              msg: transfer.error_desc,
              code: 500
            });
          }
        } else {
          return res.status(200).json({
            status: false,
            msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
            code: 500
          });
        }
      } else if (Number(transferType) == 2) {
        const amountUpdate = Math.floor(Number(amount) * 1000);

        const user = await findByID(req.user.id);

        const tcgService = new TcgService(getApiConfig.api_config);

        const withDraw = await tcgService.userTransfer(
          user.username,
          getProductConfig.product_type,
          2,
          Number(amount),
          Helper.randomInteger(100000000000, 999999999999) // transID
        );

        if (withDraw) {
          if (withDraw.status == 0) {
            user.coin += amountUpdate;
            await user.save();
            await user.reload();

            // create balance fluctuation
            await BalanceFluct.createBalaceFluct(
              user.id,
              BalanceFluct.BalanceFluctModel.ACTION_ENUM.TRANSFER_WALLET,
              BalanceFluct.BalanceFluctModel.TYPE_ENUM.PLUS,
              Number(amountUpdate),
              user.coin,
              `Rút ${Helper.numberWithCommas(amount)} điểm từ ${getProductConfig.product_code} - cộng ${Helper.numberWithCommas(amountUpdate)}`
            );

            return res
              .status(200)
              .json({ status: true, user, msg: "Rút quỹ thành công!" });
          } else {
            console.log("Rút Responsive : " + JSON.stringify(withDraw));
            return res.status(200).json({
              status: false,
              msg: withDraw.error_desc,
              code: 500
            });
          }
        } else {
          return res.status(200).json({
            status: false,
            msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
            code: 500
          });
        }
      } else {
        return res.status(200).json({
          status: false,
          msg: `Đã có lỗi bất ngờ xảy ra! Vui lòng thao tác lại...`,
          code: 500
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(200).json({
        status: false,
        msg: e.message,
        code: 500
      });
    }
  },

  balanceUpdate: async (req, res) => {
    try {
      const user = req.user;
      // lấy tổng số dư tcg
      if (user.isPlay == UserModel.IS_PLAY_ENUM.TRUE) {
        // const tcgTotalBalance = await getTotalBalance(user.username);
        // if (tcgTotalBalance.status) {
        //   // tcgTotalBalance.totalBalance
        //   await backupBalanceByUser(user.username);
        // }
      }
      res.status(200).json({
        status: true
      });
    } catch (e) {
      console.log(e);
      res.status(200).json({
        status: true
      });
    }
  }
};
