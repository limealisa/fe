const Helper = require("@Helpers/helpers");
const { BetRefurnModel } = require("../../models/Bet/BetRefurn");
const BetRefurnConfig = require("@Configs/game/betRefurn.json");
const { UserModel, findByUsername, findByEmail, findByPhoneNumber } = require("@Models/User/User");
const BalanceFluct = require("@Models/User/BalanceFluct");
const { WithdrawConditionModel } = require("@Models/Withdraw/WithdrawCondition");


const GAME_CATEGORY_TEXT_ENUM = {
    "RNG": "Nổ Hũ",
    "FISH": "Bắn Cá",
    "PVP": "Game Bài",
    "LIVE": "Casino",
    "SPORTS": "Thể Thao",
    "ESPORTS": "Thể Thao Điện Tử",
    "COCKFIGHT": "Đá Gà",
    "ELOTTO": "Xổ Số"
};

module.exports = async function (username, data, timeFrom, timeTo) {
    // console.log(data);
    const rcGameCategory = {
        "RNG": [],
        "FISH": [],
        "PVP": [],
        "LIVE": [],
        "SPORTS": [],
        "ESPORTS": [],
        "COCKFIGHT": [],
        "ELOTTO": []
    };
    data.forEach(record => {
        if (record.gameCategory != null && record.gameCategory) {
            rcGameCategory[record.gameCategory.toUpperCase()].push(record);
        }
    });


    for (var gameCategory in rcGameCategory) {
        if (rcGameCategory.hasOwnProperty(gameCategory)) {
            // handle(username, objRecord[username])
            let
                totalValidBetAmount = 0,
                totalBetAmount = 0,
                totalWinAmount = 0,
                totalNetPnl = 0;

            for (const record of rcGameCategory[gameCategory]) {
                totalValidBetAmount += record.validBetAmount;
                totalBetAmount += record.betAmount;
                totalWinAmount += record.winAmount;
                totalNetPnl += record.netPnl;
            }

            if (totalValidBetAmount >= 1) { // nêú có phát sinh cược hợp lệ
                let percentReturn = 0;

                if (totalValidBetAmount * 1000 >= 50000000) {
                    percentReturn = BetRefurnConfig.BET_50000000[gameCategory];
                } else if (totalValidBetAmount * 1000 >= 10000000) {
                    percentReturn = BetRefurnConfig.BET_10000000[gameCategory];
                } else if (totalValidBetAmount * 1000 >= 1000000) {
                    percentReturn = BetRefurnConfig.BET_1000000[gameCategory];
                } else {
                    percentReturn = BetRefurnConfig.BET_LESS_1000000[gameCategory];
                }

                let amountReturn = (totalValidBetAmount / 100) * percentReturn;

                const user = await UserModel.findOne({ where: { username } });
                if (!!user) {
                    // console.log(user.coin + amountReturn);
                    BetRefurnModel.create({
                        uid: user.id,
                        username: username,
                        betAmount: totalBetAmount * 1000,
                        validBetAmount: totalValidBetAmount * 1000,
                        winAmount: totalWinAmount * 1000,
                        netPnl: totalNetPnl * 1000,
                        percentReturn: percentReturn,
                        amountReturn: amountReturn * 1000,
                        currency: "VN",
                        gameCategory,
                        status: BetRefurnModel.STATUS_ENUM.SUCCESS,
                        timeFrom,
                        timeTo
                    });
                    // console.log("username:" + username, user.coin);
                    user.coin += amountReturn * 1000;
                    await user.save();

                    // set lại điều kiện rút tiền = tiền tổng cược cũ cộng thêm tiền hoàn trả
                    const userWithdrawCondition = await WithdrawConditionModel.findByUserId(user.id);
                    if (userWithdrawCondition) {
                        userWithdrawCondition.totalMinimumBetAmount += amountReturn * 1000;
                        await userWithdrawCondition.save();
                    }
                    
                    // create balance fluctuation
                    await BalanceFluct.createBalaceFluct(
                        user.id,
                        BalanceFluct.BalanceFluctModel.ACTION_ENUM.BET_REFURN,
                        BalanceFluct.BalanceFluctModel.TYPE_ENUM.PLUS,
                        Number(amountReturn * 1000),
                        user.coin,
                        `Hoàn trả ${GAME_CATEGORY_TEXT_ENUM[gameCategory]} ${Helper.numberWithCommas(Number(amountReturn * 1000))} / ${Helper.numberWithCommas(Number(totalValidBetAmount * 1000))} - ${percentReturn}% - cộng ${Helper.numberWithCommas(Number(amountReturn * 1000))}`
                    );

                    // user.reload();
                    // console.log("username_:" + username, user.coin);
                } else {
                    console.log("User not found!");
                }
            }
        }
    }
};