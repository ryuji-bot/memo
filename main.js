$(function () {
    // 表示対象の年月を取得
    let now_date = new Date();
    let now_month = now_date.getFullYear() + '/' + (now_date.getMonth() + 1);
    $("#target_month").append(now_month);
    // ローカルストレージから表を作成
    bulidTable();
    // 画面表示時に価格の合計値を計算
    sum();
    // 挿入した行のボタンイベントをイベントハンドラへ登録する
    createDeleteEvent();


    /********************
    共通関数
    ********************/
    function removeLocalStorage(name) {
        if (isBlank(name)) {
            alert("error!!");
            return false;
        }
        // ローカルストレージから削除
        localStorage.removeItem(name);
    }

    function removeLocalStorageAll() {
        // ★ローカルストレージをすべてクリア
        localStorage.clear();
    }

    function getLocalstorageItem(name) {
        if (isBlank(name)) retun;
        return localStorage.getItem(name);
    }

    function saveLocalstorage(name, data) {
        if (isBlank(name) || isBlank(data)) {
            alert("error!!");
            return false;
        }

        // ローカルストレージに新規保存or上書き
        localStorage.setItem(name, data);
        return true;
    }

    //ローカルストレージ名生成
    function getLocalStorageName(ym = '') {
        let base_name = '_kakeibo';
        if (isBlank(ym)) {
            let target_month = $("#target_month").text();
            ym = target_month.replace(/\//g, "");
        }
        return ym + base_name;
    }

    // テーブルを自動生成する
    function bulidTable() {
        let tableBody = "";
        // テーブルを初期化
        $("table tbody tr").remove();

        // ローカルストレージ名取得
        let localstorage_name = getLocalStorageName();
        let localSt = getLocalstorageItem(localstorage_name);
        // ローカルストレージのデータ取得
        // JSON形式から連想配列に変換
        let localStJSON = JSON.parse(localSt);

        $(localStJSON).map(function (index, line) {
            tableBody += "<tr>";
            tableBody += "<td>" + line["date"] + "</td>";
            tableBody += "<td class='name'>" + line["name"] + "</td>";
            tableBody += "<td class='recomended'>" + line["recomended"] + "</td>";
            tableBody += "<td class='record'>" + line["record"] + "</td>";
            tableBody += '<td><input type="button" class="delete" value="削除"></td>';
            tableBody += "</tr>";
        });
        // テーブルを生成
        $('table tbody').append(tableBody);
    }

    // 空欄チェック
    function isBlank(data) {
        if (data == '') {
            return true;
        } else {
            return false;
        }
    }

    // 合計値を求める
    function sum() {
        // 表の金額を取得する(tdの奇数列を取得)
        let recordlist = $("table td[class=record]").map(function (index, val) {
            let record = parseInt($(val).text());
            if (record >= 0) {
                return record;
            } else {
                return null;
            }
        });
        // 価格の合計を求める
        let total = 0;
        recordlist.each(function (index, val) {
            total = total + val;
        });
        $(".sum_record").text("合計：" + total + "冊");
    }

    // テーブル情報を読み込みJSON形式変換して返す
    function getJsonFromTable() {
        let counter = 0;
        let line = [];
        $("table tbody tr").map(function (index, val) {
            line[counter] = {
                "date": $(val).children().eq(0).text()
                , "name": $(val).children().eq(1).text()
                , "recomended": $(val).children().eq(2).text()
                , "record": $(val).children().eq(3).text()
            };
            counter += 1;
        });
        return line;
    }

    function createDeleteEvent() {
        $(document).on("click", ".delete", function (event) {
            let target = $(event.target);
            target.parents("tr").remove();
            // 合計値を再計算
            sum();
            let line = getJsonFromTable();
            // 連想配列からJSON形式に変換
            let mainJSON = JSON.stringify(line);
            //　ローカルストレージに保存
            saveLocalstorage(getLocalStorageName(), mainJSON);
        });
    }

    /********************
    各種イベント処理
    ********************/
    // 前月リンク押下時の処理
    $("#get_before_month").click(function () {
        let target_month_str = $("#target_month").text();
        let target_month_array = target_month_str.split("/");
        let last_date = new Date(target_month_array[0], target_month_array[1] - 2, 1);
        let last_month = last_date.getFullYear() + '/' + (last_date.getMonth() + 1);
        let last_ym = last_date.getFullYear().toString() + (last_date.getMonth() + 1).toString();
        $("#target_month").text(last_month);
        // テーブルフォームの再作成
        bulidTable();
        // 合計金額の再計算
        sum();
        // 挿入した行のボタンイベントをイベントハンドラへ登録する
        createDeleteEvent();
    });

    // 翌月リンク押下時の処理
    $("#get_next_month").click(function () {
        let target_month_str = $("#target_month").text();
        let target_month_array = target_month_str.split("/");
        let next_date = new Date(target_month_array[0], target_month_array[1], 1);
        let next_month = next_date.getFullYear() + '/' + (next_date.getMonth() + 1);
        let next_ym = next_date.getFullYear().toString() + (next_date.getMonth() + 1).toString();
        $("#target_month").text(next_month);
        // テーブルフォームの再作成
        bulidTable();
        // 合計金額の再計算
        sum();
        createDeleteEvent();
    });

    // addボタン押下時の処理
    $("#add").click(function () {
        let name = $("#product_name").val();
        let recomended = $("#product_recomended").val();
        let record = $("#product_record").val();
        let date = new Date();
        let str_date = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();

        // 空欄チェック
        if (isBlank(name) || isBlank(recomended) || isBlank(record)) {
            alert('空欄の項目があります。');
            return;
        }
        // 数値チェック
        // if (!$.isNumeric(record)) {
        //     alert('価格は数値で入力してください。');
        //     return;
        // }

        // 行を追加
        $('table').append('<tr><td>' + str_date + '</td>'
            + '<td class="name">' + name + '</td>'
            + '<td class="recomended">' + recomended + '</td>'
            + '<td class="record">' + record + '</td>'
            + '<td><input type="button" class="delete" value="削除"></td>'
            + '</tr>');

        //ローカルストレージに保存
        let product = { "date": str_date, "name": name, "recomended": recomended, "record": record };
        //既存のローカルストレージの値を取得
        let mainArray = [];
        let localStJSON = getLocalstorageItem(getLocalStorageName());
        if (localStJSON != null && localStJSON != "") {
            // JSON形式から連想配列に変換
            let mainArray = JSON.parse(localStJSON);
        }

        mainArray.push(product);

        // 連想配列からJSON形式に変換
        let mainJSON = JSON.stringify(mainArray);
        //　ローカルストレージに保存
        saveLocalstorage(getLocalStorageName(), mainJSON);

        // 合計値を再計算
        sum();

        // 挿入した行のボタンイベントをイベントハンドラへ登録する
        createDeleteEvent();
    });

    // clearボタン押下時の処理
    $("#clear").click(function () {
        if (!confirm('当月分のデータを削除します。よろしいですか？')) {
            return false;
        } else {
            removeLocalStorage(getLocalStorageName());
            $("table tbody tr").remove();
            sum();
        }
    });
});