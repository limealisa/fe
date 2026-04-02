const { Op } = require("sequelize");
const redis = require("@Databases/redis");
const Helper = require("@Helpers/helpers");
const {
    ERROR_PAGE,
    ERROR_FORM,
    ERROR_AUTH,
    ERROR_AUTH_MESSAGE,
    ERROR_MESSAGES,
    SUCCESS
} = require("@Helpers/contants");
const { parseInt } = require("@Helpers/Number");

const { ApiConfigModel } = require("@Models/GameApi/ApiConfig");
const { ApiGameConfigModel } = require("@Models/GameApi/ApiGameConfig");
const { ApiProductConfigModel } = require("@Models/GameApi/ApiProductConfig");

module.exports = {
    index: async (req, res) => {
        try {
            res.status(200).json({
                status: true,
                msg: SUCCESS,
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
    ApiConfig: {
        GetList: async (req, res) => {
            try {
                const getData = await ApiConfigModel.findAll({
                    where: {},
                    order: [["id", "DESC"]],
                    attributes: { exclude: ["deletedAt"] }
                });
                return res.status(200).json({
                    status: true,
                    data: getData,
                    msg: "SUCCESS"
                });
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Create: async (req, res) => {
            try {
                const {
                    api_name,
                    api_product,
                    api_config,
                    description,
                    logo
                } = req.body;

                const create = await ApiConfigModel.create({
                    api_name,
                    api_product,
                    api_config,
                    description,
                    logo
                });

                if (!create) return res.status(200).json({
                    status: false,
                    msg: "Error create!",
                    code: 500
                });

                return res.status(200).json({
                    status: true,
                    data: create,
                    msg: "SUCCESS"
                });
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Delete: async (req, res) => {
            try {
                try {
                    const { id } = req.params;
    
                    const deleteItem = await ApiConfigModel.destroy({
                        where: { id },
                        force: true
                    });
    
                    if (!!deleteItem) {
                        return res.status(200).json({
                            status: true,
                            data: null,
                            msg: "Success"
                        });
                    } else {
                        return res.status(200).json({
                            status: false,
                            msg: "Err Delete"
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
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Update: async (req, res) => {
            try {
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        }
    },
    ProductConfig: {
        GetList: async (req, res) => {
            try {
                const getData = await ApiProductConfigModel.findAll({
                    where: {},
                    order: [["id", "DESC"]],
                    attributes: { exclude: ["deletedAt"] }
                });
                return res.status(200).json({
                    status: true,
                    data: getData,
                    msg: "SUCCESS"
                });
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Create: async (req, res) => {
            try {
                const {
                    product_api,
                    product_name,
                    product_code,
                    product_type,
                    product_mode,
                    description,
                    logo,
                    thumbnail,
                    icon
                } = req.body;

                const checkExistProductApi = await ApiConfigModel.findOne({ where: { api_name: product_api } });
                if (!checkExistProductApi) return res.status(200).json({
                    status: false,
                    msg: "Api Config not found!",
                    code: 500
                });

                const checkExistProductCode = await ApiProductConfigModel.findOne({ where: { product_code } });
                if (checkExistProductCode) return res.status(200).json({
                    status: false,
                    msg: "Product Code exited!",
                    code: 500
                });
                const checkExistProductName = await ApiProductConfigModel.findOne({ where: { product_name } });
                if (checkExistProductName) return res.status(200).json({
                    status: false,
                    msg: "Product Name exited!",
                    code: 500
                });
                const checkExistProductType = await ApiProductConfigModel.findOne({ where: { product_type } });
                if (checkExistProductType) return res.status(200).json({
                    status: false,
                    msg: "Product Type exited!",
                    code: 500
                });

                const create = await ApiProductConfigModel.create({
                    product_api,
                    product_name,
                    product_code,
                    product_type,
                    product_mode,
                    description,
                    logo,
                    thumbnail,
                    icon
                });

                if (!create) return res.status(200).json({
                    status: false,
                    msg: "Error create!",
                    code: 500
                });

                return res.status(200).json({
                    status: true,
                    data: create,
                    msg: "SUCCESS"
                });
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Delete: async (req, res) => {
            try {
                const { id } = req.params;

                const deleteItem = await ApiProductConfigModel.destroy({
                    where: { id },
                    force: true
                });

                if (!!deleteItem) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Delete"
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
        Update: async (req, res) => {
            try {
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        }
    },
    GameConfig: {
        GetList: async (req, res) => {
            try {

                const page = parseInt(req.query.page, true)
                    ? parseInt(req.query.page, true)
                    : 1;
                const kmess = parseInt(req.query.limit, true)
                    ? parseInt(req.query.limit, true)
                    : 10;

                let match = {};

                // filter
                if (!!req.query.game_code) {
                    match.game_code = { [Op.like]: `%${req.query.game_code}%` };
                }
                if (!!req.query.game_name) {
                    match.game_name = { [Op.like]: `%${req.query.game_name}%` };
                }
                if (!!req.query.product_type) {
                    match.product_type = { [Op.like]: `%${req.query.product_type}%` };
                }
                if (!!req.query.game_type) {
                    match.game_type = req.query.game_type;
                }

                const total = await ApiGameConfigModel.count({ where: match });

                const getData = await ApiGameConfigModel.findAll({
                    where: match,
                    offset: 0 + (page - 1) * kmess,
                    limit: kmess,
                    order: [["id", "DESC"]],
                    attributes: { exclude: ["deletedAt"] }
                });

                return res.status(200).json({
                    status: true,
                    data: {
                        dataExport: getData,
                        page: page,
                        kmess: kmess,
                        total: total
                    },
                    msg: "SUCCESS"
                });
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Create: async (req, res) => {
            try {
                const {
                    product_type,
                    product_code,
                    game_type,
                    game_code,
                    game_name,
                    game_icon,
                    game_trial_support,
                    is_hot,
                    description
                } = req.body;

                const checkProductType = await ApiProductConfigModel.findOne({ where: { product_type: product_type } });
                if (!checkProductType) return res.status(200).json({
                    status: false,
                    msg: "Product not found!",
                    code: 500
                });

                const checkExistGameCode = await ApiGameConfigModel.findOne({ where: { game_code } });
                if (checkExistGameCode) return res.status(200).json({
                    status: false,
                    msg: "Game Code exited!",
                    code: 500
                });

                const create = await ApiGameConfigModel.create({
                    product_type,
                    product_code: checkProductType.product_code,
                    game_type,
                    game_code,
                    game_name,
                    game_icon,
                    game_trial_support,
                    is_hot,
                    description
                });

                if (!create) return res.status(200).json({
                    status: false,
                    msg: "Error create!",
                    code: 500
                });

                return res.status(200).json({
                    status: true,
                    data: create,
                    msg: "SUCCESS"
                });
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        },
        Delete: async (req, res) => {
            try {
                const { id } = req.params;

                const deleteItem = await ApiGameConfigModel.destroy({
                    where: { id },
                    force: true
                });

                if (!!deleteItem) {
                    return res.status(200).json({
                        status: true,
                        data: null,
                        msg: "Success"
                    });
                } else {
                    return res.status(200).json({
                        status: false,
                        msg: "Err Delete"
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
        Update: async (req, res) => {
            try {
            } catch (e) {
                console.log(e);
                return res.status(200).json({
                    status: false,
                    msg: e.message,
                    code: 500
                });
            }
        }
    },
};
