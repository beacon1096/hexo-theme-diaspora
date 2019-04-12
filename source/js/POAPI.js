var scriptVersion = "V2 2.43";

//var server="localhost:1096";
var server="111.231.224.214:1096";

function toHMS(time, doDetail) {
    //space:replace space with ' ' or '0'
    var space=" ";
    var arr = Array();
    var t = time;
    arr[0] = Math.floor(t / 3600);
    t = t % 3600;
    arr[1] = Math.floor(t / 60);
    t = t % 60;
    arr[2] = t;
    if (arr[0] < 10) arr[0] = space + arr[0].toString();
    if (arr[1] < 10) arr[1] = space + arr[1].toString();
    if (arr[2] < 10) arr[2] = space + arr[2].toString();
    if(doDetail)return arr;
    else{
        var text="";
        if(arr[0]!=0)text+=arr[0].toString() + " 小时 ";
        if(arr[1]!=0)text+=arr[1].toString() + " 分钟 ";
        if(arr[2]!=0)text+=arr[2].toString() + " 秒 ";
        return text;
    }
}

function getQueueAndTime() {
    var res;
    $.get("//" + server + "/api/queue", "", function (data) {
        res = data.toString();
        var target = document.getElementById("list");
        var content = JSON.parse(res);
        var text;
        if (content.isEmpty === true) {
            text = "无";
        } else {
            var queue = content.queue;
            var length = queue.length;
            text = "";
            for (var i = 0; i <= length - 1; i++) {
                text += queue[i].name + ", ";
                var arr = toHMS(queue[i].time, "  ");
                text += "预计用时: ";
                text += arr[1] + "分" + arr[2] + "秒";
                if (queue[i].prepTime != 0) {
                    text += ", 其中准备用时";
                    var arr1 = toHMS(queue[i].prepTime, "  ");
                    text += arr1[1] + "分" + arr1[2] + "秒";
                }
                text += '\u000a';
            }
        }
        target.innerText = text;
        //timeA
        target = document.getElementById("time");
        if (content.isEmpty === true) {
            target.innerText = "现在";
        } else {
            var time = toHMS(content.time, " ");
            var stringRes = "最晚 ";
            if (time[0] > 0) {
                stringRes += time[0].toString() + " 小时 ";
            }
            if (time[0] > 0 || time[1] > 0) {
                stringRes += time[1].toString() + " 分钟 ";
            }
            if (time[0] > 0 || time[1] > 0 || time[2] > 0) {
                stringRes += time[2].toString() + " 秒 ";
            }
            stringRes += " 后,在 ";
            stringRes += content.estimate;
            target.innerText = stringRes;
        }
        //timeB
        $.get("//" + server + "/api/server/config/preptime", "", function (data) {
            res = data.toString();
            var content = JSON.parse(res);
            var prep=content.preptime;
            var perform=content.performtime;
            var extra=content.extratime;
            var text="准备时长: " + toHMS(prep,false) + ", 排练时长: " + toHMS(perform,false) + ", 额外准备时长: " + toHMS(extra,false);
            var time=document.getElementById("timeSchedule");
            time.innerText=text;
        }).error(function(){

        });
    }).error(function () {

    });
}

function confirmSubmit() {
    return confirm("请确认您的提交是否正确。\u000a如果需要取消工单，必须前往礼堂或与网络部工作人员联系。");
}

function getPSA(showAlert) {
    var res;
    $.get("//" + server + "/api/psa", "", function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        var target = document.getElementById("PSA");
        if (content.isEmpty == true) {
            target.innerHTML = "暂无";
            return;
        }
        var psa = content.content;
        target.innerHTML = psa;
        if(showAlert)alert("当前通知:" + psa);
    }).error(function () {
        alert("没有成功获取当前通知：请联系Beacon1096以解决此问题");
    });
    return res;
}

function push(_grade, _class) {
    if (_grade > 3 || _grade < 1 || _class < 1 || _class > 12) {
        if (!(_grade == 3 && _class == 13)) {
            alert("发生预料外的错误。请联系Beacon1096。");
            return;
        }
    }
    var name = "";
    if(_grade === 1)name+="高一";
    if(_grade === 2)name+="高二";
    if(_grade === 3)name+="高三";
    name += " "
    if(_class === 1)name+="一班";
    if(_class === 2)name+="二班";
    if(_class === 3)name+="三班";
    if(_class === 4)name+="四班";
    if(_class === 5)name+="五班";
    if(_class === 6)name+="六班";
    if(_class === 7)name+="七班";
    if(_class === 8)name+="八班";
    if(_class === 9)name+="九班";
    if(_class === 10)name+="十班";
    if(_class === 11)name+="十一班";
    if(_class === 12)name+="十二班";
    if(_class === 13)name+="十三班";
    if (!confirmSubmit()) return;
    var request = "{\"name\":\""+name+"\"}";
    var globalJson = "";
    $.post("//" + server + "/api/queue", request, function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        globalJson = content;
        if (content.result === true) {
            if (content.instant === false) {
                var notify = "成功加入队列；请注意排练时间，提前到达以做好准备。\u000a你的排练工单开始不会晚于:";
                var estimate = content.estimate;
                alert(notify + estimate);
            } else {
                var request2 = "isFirst=true";
                $.get("//" + server + "/api/server/config/preptime", request2, function (data2) {
                    res2 = data2.toString();
                    var content2 = JSON.parse(res2);
                    var prepTime;
                    prepTime = content2.time;
                    var notify = "成功加入队列；你是目前第一个。\u000a你的排练工单即刻生效，请即刻前往礼堂开始排练。\u000a你的准备时间有 ";
                    notify += prepTime+ " 秒。";
                    alert(notify);
                }).error(function () {
                    alert("您的排练工单已提交，但没有成功获取准备时长。请刷新页面以获取您的准备时长，如仍有异常联系请Beacon1096以解决此问题。");
                });
            }
            updateCP();
        } else {
            if (globalJson.reason == "repeated") {
                alert("请不要重复提交申请。\u000a当你目前在队列中的排练完成后，你才能继续下一次申请。");
            }
            if (globalJson.reason == "remote disabled") {
                alert("服务器目前不接受提交申请。可能原因是目前排练场馆不开放。\u000a如果你确信现在场馆开放排练，请联系网络部工作人员。");
            }
        }
    }).error(function (data) {
        var content = JSON.parse(data.responseText);
        if (content.reason == "repeated") {
            alert("请不要重复提交申请。\u000a当你目前在队列中的排练完成后，你才能继续下一次申请。");
        }
        else if (content.reason == "remote disabled") {
            alert("服务器目前不接受提交申请。可能原因是目前排练场馆不开放。\u000a如果你确信现在场馆开放排练，请联系网络部工作人员。");
        }
        else{
            alert("服务器通讯异常，请到现场取号或联系网络部工作人员。");
        }
    });
    return res;
}

function pushC(_club) {
    if (_club.length > 10) {
        alert("社团名称过长，请调整名称。");
        return "Failed";
    }
    if (_club.length < 3) {
        alert("社团名称过短，请调整名称。");
        return "Failed";
    }
    if (isEmojiCharacter(_club)) {
        alert("社团名称含非法字符，请调整名称。");
        return "Failed";
    }
    if (_club.toString().includes("实验中学") === false) {
        alert("请按照命名规则重新命名，提交社团请求。");
        return "Failed";
    }
    var res;
    var request = "{\"name\":\""+_club+"\"}";
    if (!confirmSubmit()) return;
    $.post("//" + server + "/api/queue", request.toString(), function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        if (content.result == true) {
            if (content.instant == false) {
                var notify = "成功加入队列。\u000a请注意排练时间，提前到达以做好准备。\u000a你的排练工单开始不会晚于: ";
                var targetTime = content.targetTime;
                alert(notify + targetTime);
            } else {
                var request2 = "isFirst=true";
                $.get("//" + server + "/api/server/config/preptime", request2, function (data2) {
                    res2 = data2.toString();
                    var content2 = JSON.parse(res2);
                    var prepTime;
                    prepTime = content2.time;
                    var notify = "成功加入队列；你是目前第一个。\u000a你的排练工单即刻生效，请即刻前往礼堂开始排练。\u000a你的准备时间有 ";
                    notify += prepTime+ " 秒。";
                    alert(notify);
                }).error(function () {
                    alert("您的排练工单已提交，但没有成功获取准备时长。请刷新页面以获取您的准备时长，如仍有异常联系请Beacon1096以解决此问题。");
                });
            }
            updateCP();
        } else {
            if (content.reason == "repeated") {
                alert("请不要重复提交申请。\u000a当你目前在队列中的排练完成后，你才能继续下一次申请。");
            }
            if (content.reason == "disabled") {
                alert("服务器目前不接受提交申请。\u000a可能原因是目前排练场馆不开放。\u000a如果你确信现在场馆开放排练，请联系高二(1)班网络部工作人员。");
            }
        }
    }).error(function () {
        alert("服务器通讯异常，请到现场取号或联系Beacon1096。");
    });
    return res;
}

function getServerVersion() {
    var res;
    $.get("//" + server + "/api/server", "", function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        var target = document.getElementById("serverVersion");
        target.innerText = content.version;
    }).error(function () {

    });
    return res;
}

function updateCP(){
    getPSA(false);
    getQueueAndTime();
    getServerVersion();
}

updateCP();
//getPSA(true);
var gradeTarget = document.getElementById("gradeTarget");
var classTarget = document.getElementById("classTarget");
var c13 = document.getElementById("c13");
var submitButton = document.getElementById("submitButton");
var clubButton = document.getElementById("clubButton");
var clubTarget = document.getElementById("clubTarget");
var uaButton = document.getElementById("UAChecker");
var POAPIVersion = document.getElementById("poapiVersion");
var updateButton = document.getElementById("updateButton");
POAPIVersion.innerText = scriptVersion;
classTarget.remove(12);
gradeTarget.onclick = function () {
    if (gradeTarget.selectedIndex === 2) {
        classTarget.add(c13);
    } else classTarget.remove(12);
}
submitButton.onclick = function () {
    push(gradeTarget.selectedIndex + 1, classTarget.selectedIndex + 1);
}
clubButton.onclick = function () {
    pushC(clubTarget.value);
}
uaButton.onclick = function () {
    alert('当前浏览器:' + navigator.appName + ',版本' + navigator.appVersion);
    alert('当前UA:' + navigator.userAgent);
    alert('CodeName:' + navigator.appCodeName);
}
updateButton.onclick=function () {
    updateCP();
};
console.log("POAPI Version " + scriptVersion.toString());
