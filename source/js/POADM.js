var scriptVersion = "V2 2.3";

//var server="localhost:1096";
var server="111.231.224.214:1096";

function confirmOperation() {
    return confirm("警告：危险操作。此操作不可逆。\u000a如果确认执行此操作，点击是。");
}

function getAPI(){
    var res;
    $.get("//" + server + "/api/status", "", function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        var target = document.getElementById("apiStatus");
        var string;
        var button = document.getElementById("apiSwitch");
        var buttonText;
        if(content.enabled === true) 
        {
            string="已启用";
            buttonText="禁用";
        }
        else {
            string="已禁用";
            buttonText="启用";
        }
        target.innerText = string;
        button.innerText = buttonText;
        return content.result;
    }).error(function () {

    });
    return res;
}

function switchAPI(){
    getAPI();
    var target = document.getElementById("apiStatus");
    var request;
    if(target.innerText === "已启用"){
        request="{\"operation\":\"disable\"}";
    }
    else if(target.innerText === "已禁用"){
        request="{\"operation\":\"enable\"}";
    }
    else{
        alert("Internal error.");
    }
    $.ajax({
        url: "//" + server + "/api/status",
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                updateCP();
                alert("操作成功完成。");
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(){
            alert("服务器通讯异常，请联系Beacon1096。");
        }
    });
}
function setPSA(){
    var contentArea = document.getElementById("newPSAContent");
    var content = contentArea.value;
    request="{\"PSA\":\""+content+"\"}";
    $.ajax({
        url: "//" + server + "/api/psa",
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                getPSA();
                alert("操作成功完成。");
                contentArea.value = "";
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(){
            alert("服务器通讯异常，请联系Beacon1096。");
        }
    });
}

function getQueueAdv() {
    var res;
    $.get("//" + server + "/api/queue", "", function (data) {
        res = data.toString();
        var target = document.getElementById("advList");
        var content = JSON.parse(res);
        var text;
        if (content.isEmpty === true) {
            text = "无";
        } else {
            var queue = content.queue;
            var length = queue.length;
            console.log(length);
            text = "";
            for (var i = 0; i <= length - 1; i++) {
                text += "No." + queue[i].id + ", ";
                text += queue[i].name + ", ";
                var arr = toHMS(queue[i].time, "  ");
                if(queue[i].started === true){
                    text += "已开始, 结束于: " + queue[i].estimateEnd + " ,还剩 " + queue[i].time.toString() + " 秒";
                }
                else{
                    text += "开始于: ";
                    text += queue[i].estimateStart;
                    text += ",结束于: ";
                    text += queue[i].estimateEnd;
                    if (queue[i].prepTime != 0) {
                        text += ", 准备用时";
                        var arr1 = toHMS(queue[i].prepTime, "  ");
                        text += arr1[1] + "分" + arr1[2] + "秒";
                    }
                    else{
                        text += ",无准备用时";
                    }
                }
                text += '\u000a';
            }
        }
        target.innerText = text;
        console.log(content);
    }).error(function () {

    });
    return res;
}

function deleteCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    if(currentTarget == null){
        errorNoParameter();
        return;
    }
    if(!confirmOperation())return;
    $.ajax({
        url: "//" + server + "/api/queue/"+currentTarget.toString(),
        type: 'DELETE',
        data: '',
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function upCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    if(currentTarget == null){
        errorNoParameter();
        return;
    }
    var request="{\"operation\":\"up\"}";
    $.ajax({
        url: "//" + server + "/api/queue/"+currentTarget.toString(),
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason == "not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else if (content.reason == "unable to move") {
                alert("此小组无法被移动。可能此小组已经开始排练，或者是当前排练小组的后一个。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function downCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    if(currentTarget == null){
        errorNoParameter();
        return;
    }
    var request="{\"operation\":\"down\"}";
    $.ajax({
        url: "//" + server + "/api/queue/"+currentTarget.toString(),
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else if (content.reason == "unable to move") {
                alert("此小组无法被移动。可能此小组是当前队列中的最后一个。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function swapCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    var target = document.getElementById("swapTarget").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    var request="{\"operation\":\"down\",\"target\":"+ target.toString() + "}";
    $.ajax({
        url: "//" + server + "/api/queue/"+currentTarget.toString(),
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else if (content.reason == "unable to move") {
                alert("此小组无法被移动。可能此小组是当前队列中的最后一个。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function updatePreptimeCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    var target = document.getElementById("prepTimeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    var request="{\"operation\":\"update\",\"preptime\":" + target.toString() + "}";
    $.ajax({
        url: "//" + server + "/api/queue/"+currentTarget.toString(),
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function updateTimeCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    var target = document.getElementById("timeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    var request="{\"operation\":\"update\",\"time\":" + target.toString() + "}";
    $.ajax({
        url: "//" + server + "/api/queue/"+currentTarget.toString(),
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function appendPreptimeCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    var target = document.getElementById("prepTimeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    $.get("//" + server + "/api/queue/"+currentTarget.toString(), "", function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        var prepTime = content.preptime;
        var request="{\"operation\":\"update\",\"preptime\":" + (parseInt(target)+parseInt(prepTime)).toString() + "}";
        $.ajax({
            url: "//" + server + "/api/queue/" + currentTarget.toString(),
            type: 'PUT',
            data: request,
            success: function(data){
                res = data.toString();
                var content = JSON.parse(res);
                if (content.result == true) {
                    alert("操作成功完成。");
                    getQueueAndTime();
                    getQueueAdv();
                } else {
                    if (content.reason == "unauthorized") {
                        alert("未经授权的访问。");
                    }
                    if (content.reason == "no parameter") {
                        alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                    }
                }
            },
            error: function(data){
                var content = JSON.parse(data.responseText);
                if(content.reason=="not found"){
                    alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
                }
                else{
                    alert("服务器通讯异常，请联系Beacon1096。");
                }
            }
        });
    }).error(function () {

    });
}

function resetBoxes(){
    var preptimeInput=document.getElementById("defaultPrepTimeInput");
    var timeInput=document.getElementById("defaultTimeInput");
    var extrapreptimeInput=document.getElementById("defaultExtraPrepTimeInput");
    $.get("//" + server + "/api/server/config/preptime", "", function (data2) {
                    res2 = data2.toString();
                    var content2 = JSON.parse(res2);
                    var prepTime = content2.preptime;
                    var extraTime = content2.extratime;
                    var mainTime = content2.performtime;
                    preptimeInput.value=prepTime;
                    timeInput.value=mainTime;
                    extrapreptimeInput.value=extraTime;
                }).error(function () {
                    alert("未能获取服务器时间配置信息。请在检查网络连接后联系Beacon1096以解决此问题。");
                });
}

function appendTimeCurrent(){
    var currentTarget = document.getElementById("currentTarget").value;
    var target = document.getElementById("prepTimeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    $.get("//" + server + "/api/queue/"+currentTarget.toString(), "", function (data) {
        res = data.toString();
        var content = JSON.parse(res);
        var time = content.performtime;
        var request="{\"operation\":\"update\",\"time\":" + (parseInt(target)+parseInt(time)).toString() + "}";
        $.ajax({
            url: "//" + server + "/api/queue/" + currentTarget.toString(),
            type: 'PUT',
            data: request,
            success: function(data){
                res = data.toString();
                var content = JSON.parse(res);
                if (content.result == true) {
                    alert("操作成功完成。");
                    getQueueAndTime();
                    getQueueAdv();
                } else {
                    if (content.reason == "unauthorized") {
                        alert("未经授权的访问。");
                    }
                    if (content.reason == "no parameter") {
                        alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                    }
                }
            },
            error: function(data){
                var content = JSON.parse(data.responseText);
                if(content.reason=="not found"){
                    alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
                }
                else{
                    alert("服务器通讯异常，请联系Beacon1096。");
                }
            }
        });
    }).error(function () {

    });
}

function updatePreptime(){
    var target = document.getElementById("defaultPrepTimeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    var request="{\"preptime\":" + target.toString() + "}";
    $.ajax({
        url: "//" + server + "/api/server/config/preptime",
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}
function updateTime(){
    var target = document.getElementById("defaultTimeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    var request="{\"time\":" + target.toString() + "}";
    $.ajax({
        url: "//" + server + "/api/server/config/preptime",
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}
function updateExtraPreptime(){
    var target = document.getElementById("defaultExtraPrepTimeInput").value;
    if(currentTarget == null || target == null){
        errorNoParameter();
        return;
    }
    var request="{\"extratime\":" + target.toString() + "}";
    $.ajax({
        url: "//" + server + "/api/server/config/preptime",
        type: 'PUT',
        data: request,
        success: function(data){
            res = data.toString();
            var content = JSON.parse(res);
            if (content.result == true) {
                alert("操作成功完成。");
                getQueueAndTime();
                getQueueAdv();
            } else {
                if (content.reason == "unauthorized") {
                    alert("未经授权的访问。");
                }
                if (content.reason == "no parameter") {
                    alert("POADM js异常，请尝试刷新或联系Beacon1096。");
                }
            }
        },
        error: function(data){
            var content = JSON.parse(data.responseText);
            if(content.reason=="not found"){
                alert("队列中不存在此ID。您可能输入了错误的ID，或者此ID已过号。");
            }
            else{
                alert("服务器通讯异常，请联系Beacon1096。");
            }
        }
    });
}

function updateCP(){
    getAPI();
    getQueueAdv();
    getPSA(false);
    getQueueAndTime();
    resetBoxes();
}

function errorNoParameter(){
    alert("您没有正确地设置参数。请在第一行输入小组ID，在各自的行内输入参数。")
}

updateCP();

var POADMVersion = document.getElementById("poadmVersion");;
POADMVersion.innerText = scriptVersion.toString();
console.log("POADM Version " + scriptVersion.toString());

var apiSwitch = document.getElementById("apiSwitch");
apiSwitch.onclick=switchAPI;

var psaButton = document.getElementById("PSAButton");
psaButton.onclick=setPSA;

var currentRemoveButton = document.getElementById("currentRemove");
currentRemoveButton.onclick=deleteCurrent;

var currentUpButton = document.getElementById("currentUp");
currentUpButton.onclick=upCurrent;
var currentDownButton = document.getElementById("currentDown");
currentDownButton.onclick=downCurrent;
var currentSwapButton = document.getElementById("swapButton");
currentSwapButton.onclick=swapCurrent;

var currentPrepTimeButton = document.getElementById("prepTimeButton");
currentPrepTimeButton.onclick=updatePreptimeCurrent;
var currentTimeButton = document.getElementById("timeButton");
currentTimeButton.onclick=updateTimeCurrent;
var currentPrepTimeAppendButton = document.getElementById("prepTimeAppendButton");
currentPrepTimeAppendButton.onclick=appendPreptimeCurrent;
var currentTimeAppendButton = document.getElementById("timeAppendButton");
currentTimeAppendButton.onclick=appendTimeCurrent;

var preptimebutton=document.getElementById("defaultPrepTimeButton");
preptimebutton.onclick=updatePreptime;
var timebutton=document.getElementById("defaultTimeButton");
timebutton.onclick=updateTime;
var extrapreptimebutton=document.getElementById("defaultExtraPrepTimeButton");
extrapreptimebutton.onclick=updateExtraPreptime;