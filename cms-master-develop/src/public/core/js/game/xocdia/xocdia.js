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
    "odd": "Lẻ",
    "even": "Chẵn",
    "even-double": "Sấp Đôi",
    "white3": "3 Trắng",
    "red3": "3 Đỏ",
    "white4": "4 Trắng",
    "red4": "4 Đỏ"
};

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
    let betDoorList = {
        PLAYER: [],
        PLAYER_DOUBLE: [],
        BANKER: [],
        BANKER_DOUBLE: [],
        DRAW: [],
        SUPER: [],
    };
    betList.forEach(betData => {
        if (betData.bet.white4 > 0) betDoorList.PLAYER.push({ username: betData.username, amount: betData.bet.white4, time: betData.bet_time });
        if (betData.bet.white3 > 0) betDoorList.PLAYER_DOUBLE.push({ username: betData.username, amount: betData.bet.white3, time: betData.bet_time });
        if (betData.bet.red4 > 0) betDoorList.BANKER.push({ username: betData.username, amount: betData.bet.red4, time: betData.bet_time });
        if (betData.bet.red3 > 0) betDoorList.BANKER_DOUBLE.push({ username: betData.username, amount: betData.bet.red3, time: betData.bet_time });
        if (betData.bet.even > 0) betDoorList.DRAW.push({ username: betData.username, amount: betData.bet.even, time: betData.bet_time });
        if (betData.bet.odd > 0) betDoorList.SUPER.push({ username: betData.username, amount: betData.bet.odd, time: betData.bet_time });
    });

    createUiViewBetDooor("node-betdoor-" + WIN_TYPE.PLAYER, betDoorList.PLAYER);
    createUiViewBetDooor("node-betdoor-" + WIN_TYPE.PLAYER_DOUBLE, betDoorList.PLAYER_DOUBLE);
    createUiViewBetDooor("node-betdoor-" + WIN_TYPE.BANKER, betDoorList.BANKER);
    createUiViewBetDooor("node-betdoor-" + WIN_TYPE.BANKER_DOUBLE, betDoorList.BANKER_DOUBLE);
    createUiViewBetDooor("node-betdoor-" + WIN_TYPE.DRAW, betDoorList.DRAW);
    createUiViewBetDooor("node-betdoor-" + WIN_TYPE.SUPER, betDoorList.SUPER);

    function createUiViewBetDooor(node, arrBet) {
        $("#" + node).html(``);
        if (arrBet.length > 0) {
            let body = "";
            let totalBet = 0;
            arrBet.forEach(data => {
                totalBet += data.amount;
                body += `
                    <li class="list-group-item d-flex align-items-center">
                        <i class="fa-solid fa-user fa-fw"></i> <span class="mr-5">${data.username}</span>
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
    for (var key in WIN_TYPE) {
        if (WIN_TYPE.hasOwnProperty(key)) {
            $("#node-result-" + WIN_TYPE[key]).css("background-color", "#fff");
        }
    }
}

function setDataResult(resultType) {
    let txtResult = "";
    switch (resultType) {
        case "white4":
            txtResult = "Chẵn | 4 Trắng"
            $("#node-result-player").css("background-color", "#ffe214a3");
            $("#node-result-draw").css("background-color", "#ffe214a3");
            break;
        case "white3":
            txtResult = "Lẻ | 3 Trắng";
            $("#node-result-player_double").css("background-color", "#ffe214a3");
            $("#node-result-super").css("background-color", "#ffe214a3");
            break;
        case "red4":
            txtResult = "Chẵn | 4 Đỏ"
            $("#node-result-banker").css("background-color", "#ffe214a3");
            $("#node-result-draw").css("background-color", "#ffe214a3");
            break;
        case "red3":
            txtResult = "Lẻ | 3 Đỏ"
            $("#node-result-banker_double").css("background-color", "#ffe214a3");
            $("#node-result-super").css("background-color", "#ffe214a3");
            break;
        case "even":
            txtResult = "Chẵn | Sấp Đôi"
            $("#node-result-draw").css("background-color", "#ffe214a3");
            break;
        default:
            break;
    }
    $("#txt-result").html(txtResult);
}

function startActionBet() {
    $("#txt-result").html("....");
    document.getElementById("txt-time-remain").innerHTML = "16";
    var timeleft = 15;
    TASK_TIMER.BET_TIME = setInterval(function () {
        if (timeleft <= 0) {
            clearInterval(TASK_TIMER.BET_TIME);
            document.getElementById("txt-time-remain").innerHTML = "0";
        } else {
            document.getElementById("txt-time-remain").innerHTML = timeleft;
        }
        timeleft -= 1;
    }, 1000);
}

function setDotLineResult(data, limitDot = 30) {
    data.splice(limitDot - 1);
    // console.log(data);
    const dataResult = data.reverse();
    let body = "";
    dataResult.forEach((dotNode, index, array) => {
        let dotColor = "";
        let dotText = "";
        let dotSession = dotNode.session;
        let dotPoint = 0;
        let dotPair = "none";
        let classLastDot = (index === array.length - 1) ? "fa-beat-fade" : "";

        if (dotNode.result == "odd") {
            dotColor = "#bbbbbb";
            if (dotNode.result_door == "white3") {
                dotText = "Lẻ | 3 trắng";
            } else if (dotNode.result_door == "red3") {
                dotText = "Lẻ | 3 đỏ";
            }
        } else if (dotNode.result == "even") {
            dotColor = "#f75a3f";
            //dotPair = "underline";
            if (dotNode.result_door == "white4") {
                dotText = "Chẵn | 4 trắng";
            } else if (dotNode.result_door == "red4") {
                dotText = "Chẵn | 4 đỏ";
            } else if (dotNode.result_door == "even") {
                dotText = "Chẵn | Sấp Đôi";
            }
        }

        body += `<i style="color: ${dotColor};text-decoration: ${dotPair}" class="fa-solid fa-circle fa-xl ${classLastDot} fa-fw" data-bs-toggle="tooltip" title="#${dotSession} | ${dotText}"></i>`;
    });
    $("#dotline-last-result").html(body);
    // init tooltip
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
}

function onPostSetResultValue(value) {
    let result;
    switch (value) {
        case "player":
            result = "white4";
            break;
        case "player_double":
            result = "white3";
            break;
        case "draw":
            result = "even";
            break;
        case "banker":
            result = "red4";
            break;
        case "banker_double":
            result = "red3";
            break;
        case "reset":
            result = "reset";
            break;
    }
    ws.red({
        game: {
            xocdia: {
                event: EVENT_NAME.CLIENT.SET_RESULT_SESSION,
                data: {
                    result: result
                }
            }
        }
    });
    setConfigResultCurrentValue(result);
}

function setConfigResultCurrentValue(value) {
    let result;
    switch (value) {
        case "white4":
            result = "player";
            break;
        case "white3":
            result = "player_double";
            break;
        case "even":
            result = "draw";
            break;
        case "red4":
            result = "banker";
            break;
        case "red3":
            result = "banker_double";
            break;
        case "reset":
            result = "reset";
            break;
    }

    for (var key in WIN_TYPE) {
        if (WIN_TYPE.hasOwnProperty(key)) {
            $("input[name=config-result-" + WIN_TYPE[key] + "]").prop("checked", false);
        }
    }
    $("input[name=config-result-" + result + "]").prop("checked", true);
}

function onGetDetailBetSession(session, page = 1, kmess = 15) {
    ws.red({
        game: {
            xocdia: {
                event: EVENT_NAME.CLIENT.GET_HISTORY_BET_SESSION,
                data: {
                    session,
                    page,
                    kmess
                }
            }
        }
    });
}

function onHandleHistoryBetSession(data) {
    console.log(data);
    $("#history-bet-session-container").fadeIn();
    window.location = "#history-bet-session-container";

    $("#table-history-bet-session").html(``);
    $("#txt-view-bet-session-id").html(data.session);
    if (data.data.length > 0) {
        let body = "";
        data.data.forEach(data => {
            body += `<tr>
            <th class="" style="font-size: 14px;">
                ${data.userInfo.username}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.white4)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.white3)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.red4)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.red3)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.even)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.odd)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${numberWithCommas(data.total_bet)}
            </th>
            <th class="text-center" style="font-size: 14px;">
                ${RESULT_TEXT_ENUM[data.result]} - ${(data.result_door == "even") ? RESULT_TEXT_ENUM["even-double"] : RESULT_TEXT_ENUM[data.result_door]}
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

        let phantrangBody = '';
        const phantrang = Pagination(data.page, data.total, data.kmess);
        phantrang.forEach((page) => {
            $("#history-bet-session-pagination").html(phantrangBody);
            let active = (data.page == page) ? "active" : "";
            const urlToPage = (page !== "...") ? `javascript:void(onGetDetailBetSession(${data.session},${page}, ${data.kmess}))` : `javascript:void(0)`;
            phantrangBody += `
            <li class="page-item ${active}">
                <a href="${urlToPage}" class="page-link"><b>${page}</b></a>
            </li>
            `;
            $("#history-bet-session-pagination").html(phantrangBody);
        });
    }
}

function onGetHistorySession(page = 1, kmess = 15) {
    const session = ($("#txt-session-view").val() >> 0 == 0) ? null : $("#txt-session-view").val() >> 0;
    ws.red({
        game: {
            xocdia: {
                event: EVENT_NAME.CLIENT.GET_HISTORY_SESSION,
                data: {
                    session,
                    page,
                    kmess
                }
            }
        }
    });
}

function onHandleHistorySession(data) {
    $("#table-history-session").html(``);
    if (data.data.length > 0) {
        let body = "";
        data.data.forEach(data => {
            body += `<tr>
            <td class="text-center" style="font-size: 14px;">
                #${(data.session) ? data.session : ""}
            </td>
            <td class="text-center" style="font-size: 14px;">
                <div class="ms-auto flex-shrink-0">
                    <i style="color: ${(data.result_dice.dice1) ? "#bbbbbb": "#f75a3f"};text-decoration: none;" class="fa-solid fa-circle fa-fw"></i>
                    <i style="color: ${(data.result_dice.dice2) ? "#bbbbbb": "#f75a3f"};text-decoration: none;" class="fa-solid fa-circle fa-fw"></i>
                    <i style="color: ${(data.result_dice.dice3) ? "#bbbbbb": "#f75a3f"};text-decoration: none;" class="fa-solid fa-circle fa-fw"></i>
                    <i style="color: ${(data.result_dice.dice4) ? "#bbbbbb": "#f75a3f"};text-decoration: none;" class="fa-solid fa-circle fa-fw"></i>
                </div>
            </td>
            <td class="text-center" style="font-size: 14px;">
                ${RESULT_TEXT_ENUM[data.result]} - ${(data.result_door == "even") ? RESULT_TEXT_ENUM["even-double"] : RESULT_TEXT_ENUM[data.result_door]}
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
            <td class="text-center" style="font-size: 14px;">
                ${moment(data.createdAt).format("DD/MM/YYYY HH:mm:ss")}
            </td>
            <td class="text-center" style="font-size: 14px;">
                <button type="button" class="btn btn-sm btn-outline-primary" onclick="onGetDetailBetSession(${data.session})">Chi tiết cược</button>
            </td>
        </tr>`;
        });
        $("#table-history-session").html(body);

        let phantrangBody = '';
        const phantrang = Pagination(data.page, data.total, data.kmess);
        phantrang.forEach((page) => {
            $("#history-session-pagination").html(phantrangBody);
            let active = (data.page == page) ? "active" : "";
            const urlToPage = (page !== "...") ? `javascript:void(onGetHistorySession(${page}, ${data.kmess}))` : `javascript:void(0)`;
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