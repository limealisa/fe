let events = null;

function connect() {
    events = new EventSource(`${rootApi}/api/cms/pusher/clients?access_token=${bearerToken}`);
    events.onerror = function () {
        console.error('Error occurred:', error);
        events.close();
    }
    events.onopen = () => {
        // console.log("Connection opened!");
    };

    events.onmessage = (event) => {
        try {
            const parrenData = JSON.parse(event.data);
            const data = parrenData.data;
            if (void 0 != data.type) {
                if (data.type == "deposit") PUSH_CONTROLLER.Deposit(data.data);
                if (data.type == "withdraw") PUSH_CONTROLLER.Withdraw(data.data);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    };
}
connect();


const PUSH_CONTROLLER = {
    CreateSound: (soundname) => {
        soundManager.createSound({
            id: String(Math.random() * 1000),
            url: `/assets/audios/pusher/${soundname}.mp3`,
            autoLoad: true,
            autoPlay: true,
            onload: function () {
                // alert('The sound ' + this.id + ' loaded!');
            },
            volume: 100
        });
    },
    Deposit: (data) => {
        let uid = null;
        let username = null;
        let role = "";
        let transId = null;
        let amount = 0;
        let is_first = false;
        let link_to_user = "javascript:void(alert('Đã có lỗi xảy ra!'))";
        let link_to_transaction = "javascript:void(alert('Đã có lỗi xảy ra!'))";

        if (void 0 != data.user) {
            uid = data.user.id;
            username = data.user.username.toUpperCase();
            role = (data.user.role == "user") ? "người chơi " : "đại lý ";
            link_to_user = `/${(data.user.role == "user") ? "user" : "agency"}?username=${username}`;
        }
        if (void 0 != data.transaction) {
            transId = data.transaction.transId;
            amount = data.transaction.amount;
            is_first = data.transaction.is_first;
            link_to_transaction = `/deposit?transId=${transId}`;
        }

        toastr.success(
            `Nạp tiền ${is_first ? "lần đầu " : ""}bởi ${role}<b style="font-weight: bold">${username}</b> với số tiền <b style="font-weight: bold">${numberWithCommas(amount)}</b>
            <br /><br />
            <a href="${link_to_transaction}" class="btn btn-sm btn-rounded btn-secondary clear">Xem giao dịch</a>
            <a href="${link_to_user}" class="btn btn-sm btn-rounded btn-secondary clear">Xem ${role}</a>`,
            `Giao Dịch Mới: +${numberWithCommas(amount)}<hr>`,
            {
                progressBar: true,
                positionClass: "toastr toast-bottom-right",
                containerId: "toast-bottom-right",
                showMethod: "slideDown",
                hideMethod: "slideUp",
                timeOut: 8000
            }
        );
        PUSH_CONTROLLER.CreateSound("deposit");
    },
    Withdraw: (data) => {
        let uid = null;
        let username = null;
        let role = "";
        let transId = null;
        let amount = 0;
        let is_first = false;
        let link_to_user = "javascript:void(alert('Đã có lỗi xảy ra!'))";
        let link_to_transaction = "javascript:void(alert('Đã có lỗi xảy ra!'))";

        if (void 0 != data.user) {
            uid = data.user.id;
            username = data.user.username.toUpperCase();
            role = (data.user.role == "user") ? "người chơi " : "đại lý ";
            link_to_user = `/${(data.user.role == "user") ? "user" : "agency"}?username=${username}`;
        }
        if (void 0 != data.transaction) {
            transId = data.transaction.transId;
            amount = data.transaction.amount;
            is_first = data.transaction.is_first;
            link_to_transaction = `/withdraw?transId=${transId}`;
        }

        toastr.warning(
            `Rút tiền ${is_first ? "lần đầu " : ""}bởi ${role}<b style="font-weight: bold">${username}</b> với số tiền <b style="font-weight: bold">${numberWithCommas(amount)}</b>
            <br /><br />
            <a href="${link_to_transaction}" class="btn btn-sm btn-rounded btn-secondary clear">Xem giao dịch</a>
            <a href="${link_to_user}" class="btn btn-sm btn-rounded btn-secondary clear">Xem ${role}</a>`,
            `Yêu cầu rút: ${numberWithCommas(amount)}<hr>`,
            {
                progressBar: true,
                positionClass: "toastr toast-bottom-right",
                containerId: "toast-bottom-right",
                showMethod: "slideDown",
                hideMethod: "slideUp",
                timeOut: 8000
            }
        );
        PUSH_CONTROLLER.CreateSound("withdraw");
    },
};





let reconnecting = false;
setInterval(() => {
    if (events.readyState == EventSource.CLOSED) {
        reconnecting = true;
        console.log("reconnecting...");
        connect();
    } else if (reconnecting) {
        reconnecting = false
        console.log("reconnected!");
    }
}, 5000);
