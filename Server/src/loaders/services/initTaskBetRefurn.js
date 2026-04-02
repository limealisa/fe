const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Ho_Chi_Minh");

const taskBetRefurn = require("../../services/BetRefurns");

module.exports = async () => {
  setInterval(() => {
    const timeCheck = moment.tz('Asia/Ho_Chi_Minh').format("HH:mm");
    // if (timeCheck == "00:00") {
    console.log('Hoàn trả cược!');
    taskBetRefurn();
    // }
  }, 1800000);  //  30minute
};