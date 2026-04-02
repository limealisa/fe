'use strict';

let SOCKET_URL = "wss://service-mini-game.csn365.com/socket/cms";
// let SOCKET_URL = "ws://localhost:8009/socket/cms";

let ws = null;

// bearerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAxODk3NDgzLCJleHAiOjE3MDE5ODM4ODN9.0mksThybBo3bGq-e7H14dnTxgn-d4sR3HhGvfXWxpYk";

let EVENT_NAME = {
    CLIENT: {
        AUTHENTICATION: "authentication",
        UPDATE_BALANCE: "update_balance",
        GET_CURRENT_SESSION: "get_current_session",
        GET_CURRENT_BET: "get_current_bet",
        CONFIRM_BET: "confirm_bet",
        GET_HISTORY_BET: "get_history_bet",
        GET_LAST_RESULT_BET: "get_last_result_bet",
        SET_RESULT_SESSION: "set_result_session",
        GET_HISTORY_SESSION: "get_history_session",
        GET_HISTORY_BET_SESSION: "get_history_bet_session"
    },
    SERVER: {
        AUTHENTICATION: "authentication",
        NOTIFY: "notify",
        UPDATE_BALANCE: "update_balance",
        CURRENT_SESSION: "current_session",
        CURRENT_DATA: "current_data",
        NEW_GAME: "new_game",
        WAIT_RESULT: "wait_result",
        RESULT: "result",
        CURRENT_BET: "current_bet",
        RESULT_BET: "result_bet",
        HISTORY_BET: "history_bet",
        LAST_RESULT_BET: "last_result_bet",
        HISTORY_SESSION: "history_session",
        HISTORY_BET_SESSION: "history_bet_session"
    }
};

const STATE = {
    "finish": "Trả thưởng",
    "start": "Đang cược"
};

let CONFIG = {};

(function () {
    // SOCKET CHECK BROWSER
    if ("WebSocket" in window) { } else {
        alert("Trình duyệt của bạn không được hỗ trợ Websocket vui lòng đổi trình duyệt khác để sử dụng!");
        return;
    }

    function connect(url, isReconnect) {
        ws = new WebSocket(url);
        ws.red = function (data) { ws.send(JSON.stringify(data)); };

        ws.onopen = function () {
            if (isReconnect) {
                clearInterval(TASK_TIMER.CONNECT_SOCKET);
                fastNotifyClient("success", "Đã khôi phục kết nối!");
            }
            if (bearerToken) { ws.red({ authentication: { token: bearerToken } }); }
        }

        // SOCKET MESSAGE
        ws.onmessage = function (_data) {
            var data = JSON.parse(_data.data);

            // error login 
            if (void 0 !== data.authentication) {
                if (data.authentication === true) {
                    ws.red({ "game": { "xocxoc": { "get_config": true } } });
                    ws.red({ "game": { "xocxoc": { "join": true } } });
                    ws.red({ "game": { "xocxoc": { "view": true } } });
                    ws.red({ "game": { "xocxoc": { "get_logs": true } } });
                    ws.red({ "game": { "xocxoc": { "get_session_history": { page: 1, limit: 10 } } } });
                } else {
                    fastNotifyClient("error", "Authentication Failed!");
                }
            }

            if (void 0 !== data.notify) {
                fastNotifyClient(data.notify.type, data.notify.text);
            }

            if (void 0 !== data.game && void 0 !== data.game.xocxoc) {
                if (void 0 !== data.game.xocxoc.get_config) {
                    CONFIG = data.game.xocxoc.get_config;
                    (CONFIG.SHOW_BOT_IN_CMS)? $("#config_show_bot_on").prop("checked", true): $("#config_show_bot_off").prop("checked", true);
                }
                if (void 0 !== data.game.xocxoc.get_logs) {
                    setDotLineResult(data.game.xocxoc.get_logs, 21);
                }
                if (void 0 !== data.game.xocxoc.get_session_history) {
                    onHandleHistorySession(data.game.xocxoc.get_session_history);
                }
                if (void 0 !== data.game.xocxoc.get_session) {
                    onHandleHistoryBetSession(data.game.xocxoc.get_session);
                }
            }

            if (void 0 !== data.game && void 0 !== data.game.xocxoc && void 0 !== data.game.xocxoc.data) {
                const taixiu = data.game.xocxoc.data;
                if (void 0 !== taixiu.session) {
                    onSetCurrentSessionId(taixiu.session);
                }
                if (void 0 !== taixiu.state) {
                    onSetCurrentSessionStatus(STATE[taixiu.state]);
                    if (void 0 !== taixiu.time) {
                        if (taixiu.time == CONFIG.GAME_SESSION_TIME) {
                            ws.red({ "game": { "xocxoc": { "get_logs": true } } });
                        }

                        if (taixiu.state == "start") {
                            $("#txt-time-remain").html(numberPad(taixiu.time, 2));
                        } else {
                            $("#txt-time-remain").html("00");
                        }
                    }
                }
                if (void 0 !== taixiu.result) {
                    if (taixiu.state == "finish") {
                        setDataResult(onParseResultText(taixiu.result));
                    } else {
                        resetBgResultNodeWin();
                        $("#txt-result").html(".....");
                    }

                    setResultDice(1, taixiu.result[0]);
                    setResultDice(2, taixiu.result[1]);
                    setResultDice(3, taixiu.result[2]);
                    setResultDice(4, taixiu.result[3]);
                }
                if (void 0 !== taixiu.ingame) {
                    $("#txt-total-user-online").html(taixiu.users.length);
                }
                if (void 0 !== taixiu.list) {
                    $("#txt-total-user-bet").html(taixiu.list.length);
                    // setDataCurrentBet(taixiu.bet_list);
                    setDataCurrentBet(taixiu.list);
                }
                if (void 0 !== taixiu.data) {
                    $("#taixiuTotalBet_tai").html(numberWithCommas(taixiu.data.tai));
                    $("#taixiuTotalBet_xiu").html(numberWithCommas(taixiu.data.xiu));
                    $("#taixiuTotalUser_tai").html(numberWithCommas(taixiu.data.player_tai));
                    $("#taixiuTotalUser_xiu").html(numberWithCommas(taixiu.data.player_xiu));
                    // setDataCurrentBet(taixiu.bet_list);
                }
            }


            // if (void 0 !== data.game) {
            //     if (void 0 !== data.game.baccarat) Baccarat(data.game.baccarat);
            // }
        };

        // SOCKET CLOSE BY SERVER
        ws.onclose = (e) => {
            console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
            IS_RECONNECT = true;
            fastNotifyClient("error", "Mất kết nối, đang kết nối lại!");
            // TASK_TIMER.CONNECT_SOCKET = setInterval(() => {
            //     // reconnect to server
            //     // connect(SOCKET_URL, IS_RECONNECT);
            //     window.location.reload();
            // }, 3000);
        };
    }

    // connect to server
    connect(SOCKET_URL, IS_RECONNECT);

})();