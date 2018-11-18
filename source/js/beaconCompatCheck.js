var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
var isEdge = userAgent.indexOf("Edge") > -1; //判断是否Edge浏览器
var isIEdge = userAgent.indexOf("Trident") >-1;//判断是否新版IE混合内核浏览器
var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
if(isIE || isIEdge || isEdge){
    alert("检测到IE/Edge浏览器。\n已禁用部分高级渲染元素。\n建议改用Chrome/Firefox等对现代标准支持较好的浏览器。");
    document.getElementById("header-image-logo").style.width=0;
}
console.log("current:",document.URL);