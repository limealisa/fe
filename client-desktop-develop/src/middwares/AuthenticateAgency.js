const qs = require('qs');
const axios = require('axios');
const config = require('@Config');
const { ERROR_AUTH } = require('@Helpers/contants');

module.exports = async (req, res, next) => {
    try {
        const session = req.session;
        if (session.isLogin && session.accessToken) {
            if (session.user.role == "agency") {
                next();
            } else {
                req.session.destroy((err) => {
                    res.redirect("/");
                });
            }
        } else {
            req.session.destroy((err) => {
                res.redirect("/");
            });
        }
    } catch (e) {
        console.log(e);
        req.session.destroy((err) => {
            res.redirect("/");
        });
    }
}