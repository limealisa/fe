'use strict';

let DEBUG_APP = !true;

let IS_OFFSOUND = false;
let IS_ALLOW_BET = false;
let TASK_TIMER = {
    CONNECT_SOCKET: null,
    BET_TIME: null
};
let IS_RECONNECT = false;
let IS_AUTH = false;
let AUTH_DATA = null;

let WIN_TYPE = {
    PLAYER: "player",
    PLAYER_DOUBLE: "player_double",
    BANKER: "banker",
    BANKER_DOUBLE: "banker_double",
    DRAW: "draw",
    SUPER: "super",
};

let RESULT_TEXT_ENUM = {
    "player": "PLAYER",
    "player_double": "PLAYER ĐÔI",
    "banker": "BANKER",
    "banker_double": "BANKER Đôi",
    "draw": "HÒA",
    "super": "SUPER 6"
};

let CURRENT_DICE_NUMBER_SET = 0;

function onSetCurrentSessionId(sessionId) {
    $("#txt-round-id").html("#" + sessionId);
}

function onSetCurrentSessionStatus(status) {
    $("#txt-status").html(status);
}

function onSetCurrentData(data) {
    if (void 0 !== data.session) {
        onSetCurrentSessionId(data.session);
    }
    if (void 0 !== data.config_result) {
        setConfigResultCurrentValue(data.config_result);
    }
    if (void 0 !== data.users) {
        $("#txt-total-user-online").html(data.users.length);
    }
    if (void 0 !== data.bet_list) {
        $("#txt-total-user-bet").html(data.bet_list.length);
        setDataCurrentBet(data.bet_list);
    }
}

function setDataCurrentBet(betList) {
    betList = betList.reverse();
    let betDoorList = {
        TAI: [],
        XIU: []
    }
    betList.forEach(betData => {
        if (betData.bet_type) betDoorList.TAI.push({
            is_bot: betData.is_bot,
            uid: betData.uid,
            username: betData.username,
            amount: betData.amount,
            time: betData.createdAt
        });
        if (!betData.bet_type) betDoorList.XIU.push({
            is_bot: betData.is_bot,
            uid: betData.uid,
            username: betData.username,
            amount: betData.amount,
            time: betData.createdAt
        });
    });

    createUiViewBetDooor("node-betdoor-tai", betDoorList.TAI);
    createUiViewBetDooor("node-betdoor-xiu", betDoorList.XIU);

    function createUiViewBetDooor(node, arrBet) {
        $("#" + node).html(``);
        if (arrBet.length > 0) {
            let body = "";
            let totalBet = 0;
            arrBet.forEach(data => {
                totalBet += data.amount;
                body += `
                    <li class="list-group-item d-flex align-items-center">
                        <i class="fa-solid fa-user fa-fw"></i> <span class="mr-5">${(data.is_bot) ? "BOT | " : ""}${data.username} | UID:${data.uid}</span>
                        <span class="badge bg-light-warning text-danger font-weight-medium rounded-pill ms-auto">${moment(data.createdAt).format("HH:mm:ss")}</span>
                        <span class="badge bg-light-danger text-danger font-weight-medium rounded-pill ms-auto">${numberWithCommas(data.amount)}</span>
                        </li>
                `;
            });
            let bodyAppend = `
                <li class="list-group-item d-flex align-items-center">
                    <i class="fa-solid fa-coins fa-fw"></i> <span class="mr-5" style="font-weight: 600;">TỔNG CƯỢC</span>
                    <span class="badge bg-light-info text-info font-weight-medium rounded-pill ms-auto">${numberWithCommas(totalBet)}</span>
                </li>
            ` + body;
            $("#" + node).html(bodyAppend);
        }
    }
}

function resetBgResultNodeWin() {
    $("#node-result-tai").css("background-color", "#fff");
    $("#node-result-xiu").css("background-color", "#fff");
}

function setDataResult(point) {
    let resultNode = "";
    const resultType = (point > 10) ? 1 : 0;
    switch (resultType) {
        case 1:
            resultNode = "tai"
            break;
        case 0:
            resultNode = "xiu"
            break;
        default:
            break;
    }
    $("#node-result-" + resultNode).css("background-color", "#ffe214a3");
}

function setDotLineResult(data, limitDot = 30) {
    data.splice(limitDot - 1);

    const dataResult = data.reverse();
    let body = "";
    dataResult.forEach((dotNode, index, array) => {
        let dotColor = "";
        let dotText = "";
        let dotSession = dotNode.id;
        let dotPoint = dotNode.result[0] + "-" + dotNode.result[1] + "-" + dotNode.result[2];
        let totalPoint = dotNode.result[0] + dotNode.result[1] + dotNode.result[2];
        let classLastDot = (index === array.length - 1) ? "fa-beat-fade" : "";

        if (totalPoint > 10) {
            dotText = "Tài";
            dotColor = "#3e3e3e";
        } else {
            dotText = "Xỉu";
            dotColor = "#9a9a9a";
        }

        body += `<i style="color: ${dotColor};text-decoration: none" class="fa-solid fa-circle fa-xl ${classLastDot} fa-fw" data-bs-toggle="tooltip" title="#${dotSession} | ${dotText} | ${dotPoint}"></i>`;
    });
    $("#dotline-last-result").html(body);
    // init tooltip
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
}

function onGetDetailBetSession(session) {
    ws.red({ "game": { "mini_taixiu": { "get_session": { session } } } });
}

function onHandleHistoryBetSession(data) {
    console.log(data);
    $("#history-bet-session-container").fadeIn();
    window.location = "#history-bet-session-container";

    $("#table-history-bet-session").html(``);
    $("#txt-view-bet-session-id").html(data.id);

    if (data.session_bet_order.length > 0) {
        let body = "";
        data.session_bet_order.forEach(data => {
            body += `<tr>
            <th class="text-center" style="font-size: 14px;">
                #${data.id}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${data.uid}
            </th>
            <th class="" style="font-size: 14px;">
                 ${(data.is_bot) ? "<span class='text-danger'>(BOT)</span>" : ""} ${data.user_info.username}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${(data.bet_type) ? "Tài" : "Xỉu"}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.amount)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${(data.is_win) ? "Thắng" : "Thua"}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_win)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_lose)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_refurn)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${moment(data.bet_time).format("DD/MM/YYYY HH:mm:ss")}
            </th>
        </tr>`;
        });
        $("#table-history-bet-session").html(body);

        // let phantrangBody = '';
        // const phantrang = Pagination(data.page, data.total, data.kmess);
        // phantrang.forEach((page) => {
        //     $("#history-bet-session-pagination").html(phantrangBody);
        //     let active = (data.page == page) ? "active" : "";
        //     const urlToPage = (page !== "...") ? `javascript:void(onGetDetailBetSession(${data.session},${page}, ${data.kmess}))` : `javascript:void(0)`;
        //     phantrangBody += `
        //     <li class="page-item ${active}">
        //         <a href="${urlToPage}" class="page-link"><b>${page}</b></a>
        //     </li>
        //     `;
        //     $("#history-bet-session-pagination").html(phantrangBody);
        // });
    }
}

function onGetHistorySession(page = 1, kmess = 10) {
    const session = ($("#txt-session-view").val() >> 0 == 0) ? null : $("#txt-session-view").val() >> 0;
    ws.red({ "game": { "mini_taixiu": { "get_session_history": { session, page: page, limit: kmess } } } });
}

function onHandleHistorySession(data) {
    $("#table-history-session").html(``);
    if (data.data.length > 0) {
        let body = "";
        data.data.forEach(data => {
            body += `<tr>
            <td class="text-center" style="font-size: 14px;">
                #${(data.id) ? data.id : ""}
            </td>
            <td class="text-center" style="font-size: 14px;">
                ${(data.result[0] + data.result[1] + data.result[2] > 10) ? "Tài" : "Xỉu"}
            </td>
            <td class="text-center" style="font-size: 14px;">
                ${data.result[0]} - ${data.result[1]} - ${data.result[2]} = ${data.result[0] + data.result[1] + data.result[2]}
            </td>
            <td class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_bet)}
            </td>
            <td class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_win)}
            </td>
            <td class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_lose)}
            </td>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_refurn)}
            </th>
            <td class="text-center" style="font-size: 14px;">
                ${moment(data.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </td>
            <td class="text-center" style="font-size: 14px;">
                <button type="button" class="btn btn-sm btn-outline-primary" onclick="onGetDetailBetSession(${data.id})">Chi tiết cược</button>
            </td>
        </tr>`;
        });
        $("#table-history-session").html(body);

        let phantrangBody = '';
        const phantrang = Pagination(data.page, data.total, data.limit);
        phantrang.forEach((page) => {
            $("#history-session-pagination").html(phantrangBody);
            let active = (data.page == page) ? "active" : "";
            const urlToPage = (page !== "...") ? `javascript:void(onGetHistorySession(${page}, ${data.limit}))` : `javascript:void(0)`;
            phantrangBody += `
            <li class="page-item ${active}">
                <a href="${urlToPage}" class="page-link"><b>${page}</b></a>
            </li>
            `;
            $("#history-session-pagination").html(phantrangBody);
        });
    }
}

function fastNotifyClient(type, text) {
    if (type == "success") {
        toastr.success(
            text,
            "Thành công.",
        );
    } else if (type == "warning") {
        toastr.warning(
            text,
            "Cảnh báo."
        );
    } else if (type == "error") {
        toastr.error(
            text,
            "Thất bại!"
        );
    } else if (type == "info") {
        toastr.info(
            text,
            "Nhắc nhở"
        );
    }
}

function setResultDice(dice, value) {
    $("#dice" + dice).attr("src", "/assets/images/miniGame/dice-" + value + ".png");
}

function taixiuSetDicePopup(dice) {
    CURRENT_DICE_NUMBER_SET = dice;
    $("#select-dice-set").fadeIn();
}

function taixiuSetDiceClick(value) {
    ws.red({
        "game": {
            "mini_taixiu": {
                "set_result": {
                    "dice_number": CURRENT_DICE_NUMBER_SET - 1,
                    "dice_value": value
                }
            }
        }
    });
    CURRENT_DICE_NUMBER_SET = 0;
    $("#select-dice-set").fadeOut("fast");
}

const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const createResult = (result) => {
    while (true) {
        let dice1, dice2, dice3;
        dice1 = randomInteger(1, 6);
        dice2 = randomInteger(1, 6);
        dice3 = randomInteger(1, 6);
        if (result == 1) {
            if (dice1 + dice2 + dice3 > 10) return [dice1, dice2, dice3];
        } else {
            if (dice1 + dice2 + dice3 <= 10) return [dice1, dice2, dice3];
        }
    }
}

function selectResultTaixiu(result) {
    const arrDice = createResult(result);
    ws.red({
        "game": {
            "mini_taixiu": {
                "set_result": {
                    "dice_number": [0, 1, 2],
                    "dice_value": [arrDice[0], arrDice[1], arrDice[2]]
                }
            }
        }
    });
}

function changerConfig(key, value) {
    ws.red({
        "game": {
            "mini_taixiu": {
                "set_config": {
                    "key": key,
                    "value": value
                }
            }
        }
    });
}