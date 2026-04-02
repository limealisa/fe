let FILTER = {
    page: 1,
    limit: 10,
    game_code: '',
    game_name: '',
    product_type: '',
    game_type: ''
};
const changeFilter = (key, value) => FILTER[key] = value;
const goToPage = (page) => {
    changeFilter('page', page);
    loadList();
}
$('#gameConfigFilter').on('submit', (e) => {
    e.preventDefault();
    changeFilter('page', 1);
    loadList();
});
//     // search: true,
//     // pagination: true,
//     sort: true,
//     // width: 500,
//     resizable: true,
//     columns: [
//         {
//             name: "UID",
//             id: 'id',
//             // width: '50%',
//             hidden: false,
//         },
//         {
//             name: "Tên người chơi",
//             id: 'name',
//             // width: '50%',
//             hidden: false,
//             formatter: (row) => row.toUpperCase()
//         },
//         {
//             name: "Tên Đăng Nhập",
//             id: 'username',
//             // width: '50%',
//             hidden: false,
//             formatter: (row) => row.toUpperCase()
//         },
//         {
//             name: "Đại Lý Đăng Ký",
//             id: 'Agency',
//             // width: '50%',
//             hidden: false,
//             formatter: (row) => {
//                 return row.agency_code.toUpperCase()
//             }
//         },
//         {
//             name: "Ngân Hàng",
//             id: 'BankUser',
//             // width: '50%',
//             hidden: false,
//             formatter: (row) => {
//                 if (!row.id) {
//                     return "Chưa thêm ngân hàng";
//                 }else {
//                     return `${row.bankProvide} / ${row.bankNumber} / ${row.bankName}`;
//                 }
//             }
//         },
//         {
//             name: "Số Điện Thoại",
//             id: 'phone',
//             // width: '50%',
//             hidden: false,
//         }, 
//         {
//             name: "Số Dư",
//             id: 'coin',
//             // width: '50%',
//             hidden: false,
//             formatter: (row) => {
//                 return numberWithCommas(row)
//             }
//         },
//         {
//             name: "Tiền Đã Nạp",
//             // width: '50%',
//             id: 'totalDeposit',
//             hidden: false,
//             formatter: (row) => {
//                 return numberWithCommas(row)
//             }
//         },
//         {
//             name: "Tiền Đã Rút",
//             // width: '50%',
//             hidden: false,
//             id: 'totalWithdraw',
//             hidden: false,
//             formatter: (row) => {
//                 return numberWithCommas(row)
//             }
//         },
//         {
//             name: "Lợi nhuận",
//             // width: '50%',
//             hidden: false,
//             // id: 'totalWithdraw',
//             data: (row) => {
//                 return numberWithCommas(row.totalDeposit - row.totalWithdraw)
//             },
//             // formatter: (row) => {
//             //     return numberWithCommas(row)
//             // }
//         },
//         {
//             name: "Lãi/Lỗ",
//             // width: '50%',
//             hidden: false,
//             id: 'netPnl',
//             formatter: (row) => {
//                 return numberWithCommas(row)
//             }
//         },
//         {
//             name: "Trạng Thái",
//             // width: '50%',
//             hidden: false,
//             id: 'status',
//             formatter: (row) => {
//                 return (row == 'active') ? 'Hoạt động' : 'Bị khóa';
//             }
//         },
//         {
//             name: "ĐK vòng cược",
//             // width: '50%',
//             hidden: false,
//             id: 'WithdrawConditionInfo',
//             formatter: (row) => {
//                 return `${numberWithCommas(row.minimumNumbOfBet)} / ${numberWithCommas(row.totalMinimumBetAmount)}`;
//             }
//         },
//         {
//             name: "Ngày Đăng Ký",
//             // width: '50%',
//             hidden: false,
//             id: 'createdAt',
//             formatter: (row) => {
//                 return moment(row).format("H:mm - DD/MM/YYYY");
//             }
//         },
//         {
//             name: "Hành Động",
//             // width: '50%',
//             hidden: false,
//             id: 'id',
//             data: 'id',
//             formatter: (cell) => {
//                 return `<button onclick="editRow(${cell})">Sửa</button>`;
//             }
//         },
//     ],
//     data: [],
//     language: GridJsLangConfig()
// });

const datatable = $('#table-container').DataTable({
    paging: false,
    searching: false,
    info: false,
    order: [[1, 'desc']],
    fixedColumns: {
        leftColumns: 4,
        rightColumns: 0
    },
    fixedHeader: {
        header: true,
        footer: true
    },
    scrollCollapse: true,
    scrollY: '800px',
    // autoWidth: false,
    columns: [
        { title: "", width: '550px' },
        { data: "#UID", title: "#UID", width: '50px' },
        { title: "Tên_Đăng_Nhập", width: '30px' },
        { title: "Đại_Lý_Đăng_Ký", width: '100px' },
        { title: "Tên_Người_Chơi", width: '50px' },
        { title: "Số_Lần_Nạp", width: '30px' },
        { title: "Số_Lần_Rút", width: '30px' },
        { title: "Ngân_Hàng_Người_Dùng", width: '100px' },
        { title: "Số_Điện_Thoại", width: '550px' },
        { title: "Số_Dư", width: '50px' },
        { title: "Tiền_Nạp", width: '50px' },
        { title: "Tiền_Rút", width: '30px' },
        { title: "Cược_Hợp_Lệ", width: '30px' },
        { title: "Thắng_Thua", width: '100px' },
        { title: "Hoàn_Trả" },
        { title: "Khuyễn_Mãi" },
        { title: "Khuyễn_Mãi_Tặng"},
        { title: "Trạng_Thái", width: '550px' },
        { title: "ĐK_vòng_cược", width: '550px' },
        { title: "Ngày_Đăng_Ký", width: '550px' },
        // { title: "User_Agent", width: '550px' },
        { title: "IP_Gần_nhất", width: '550px' },
    ],
    responsive: true,
    dom: 'Bfrtip',
    buttons: [
        // {
        //     extend: 'colvis',
        //     text: '<i class="fa fa-eye"></i>',
        //     className: 'btn btn-info align-items-center',
        //     collectionLayout: 'one-column',
        //     popoverTitle: 'Column visibility control',
        //     columnText: function (dt, idx, title) {
        //         // return idx + 1 + ': ' + title;
        //         return (title.includes("_")) ? title.replaceAll("_", " ") : title;  
        //     },
        // },
        {
            extend: 'excel',
            text: '<i class="fa fa-file-excel"></i>',
            filename: 'Danh sách người chơi',
            className: 'btn btn-info align-items-center',
            exportOptions: {
                columns: ':visible' // Export only visible columns
            }
        },
        // {
        //     extend: 'pdf',
        //     text: '<i class="fa fa-file-pdf"></i>',
        //     filename: 'MyDataTableExport',
        //     className: 'btn btn-info align-items-center',
        //     exportOptions: {
        //         columns: ':visible' // Export only visible columns
        //     }
        // },
    ],
})
.buttons()
.container()
.appendTo("#datatable-export-btn");

const loadList = async () => {
    const filter = $.param(FILTER);
    const api = `${mainApi}/user?` + filter;
    $.ajax({
        method: 'get',
        maxBodyLength: Infinity,
        url: api,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + bearerToken }
    }).done(function (response) {
        if (response.status) {
            const data = response.data.dataExport;
            const total = response.data.total;
            // const total = 1000;
            const kmess = response.data.kmess;
            const page = response.data.page;
        } else {

        }
    });
}

$(document).ready(function () {
    $("input[name='game_code']").on('keyup', (e) => {
        changeFilter('game_code', e.target.value);
    })
    $("input[name='game_name']").on('keyup', (e) => {
        changeFilter('game_name', e.target.value);
    })
    $("select[name='product_type']").on('change', (e) => {
        changeFilter('product_type', e.target.value);
    })
    $("select[name='game_type']").on('change', (e) => {
        changeFilter('game_type', e.target.value);
    });

    // loadList();
});


