const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");
const { Op } = require("sequelize");
// const Sequelize = require("sequelize");
const { BetHistoryModel } = require("../../models/Bet/BetHistory");
const handle = require("./handle");

module.exports = async () => {
    try {
        const currentTime = moment.tz('Asia/Ho_Chi_Minh');
        // const sinceDay = 1;
        // const sinceHour = 1;
        const sinceMinute = 30;
        const timeFrom = currentTime.subtract(sinceMinute, "minutes").format("YYYY-MM-DD HH:mm:ss");
        const timeTo = currentTime.add(sinceMinute, "minutes").format("YYYY-MM-DD HH:mm:ss");

        let match = {};
        match.betTime = { [Op.between]: [timeFrom, timeTo] }

        const getBetRecord = await BetHistoryModel.findAll({
            where: match,
            attributes: {
                exclude: ['updatedAt', 'deletedAt']
            },
            order: [["id", "ASC"]],
        });

        let objRecord = {};
        getBetRecord.forEach(record => { objRecord[record.username] = []; });
        getBetRecord.forEach(record => { objRecord[record.username].push(record); });
        for (var username in objRecord) {
            if (objRecord.hasOwnProperty(username)) {
                handle(username, objRecord[username], timeFrom, timeTo);
            }
        }
    } catch (err) {
        console.log(err);
    }
}