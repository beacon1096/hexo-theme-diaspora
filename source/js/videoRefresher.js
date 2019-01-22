function refreshRatio(){
    //var video = document.getElementById("Video");
    var video = document.getElementsByClassName("VideoPlayer");
    if(video==null)alert("No Video!");
    var article =document.getElementById("article");
    var ratio = 1;
    for(let i=0;i<video.length;i++){
        video[i].style.height = Math.floor(ratio*article.clientWidth/16*11)+"px";    
    }
    if(video.length==0)console.log("No video was found on this page.");
    else console.log("target height:"+video[0].style.height);
}
refreshRatio();
window.onresize=function(){
    refreshRatio();
}
window.onchange=function(){
    refreshRatio();
}
window.onended=function(){
    refreshRatio();
}
window.onloadend=function(){
    refreshRatio();
}
window.onloadstart=function(){
    refreshRatio();
}
window.onload=function(){
    refreshRatio();
}
window.onreset=function(){
    refreshRatio();
}
window.onunload=function(){
    refreshRatio();
}
window.onclick=function(){
    refreshRatio();
}
window.onpagehide=function(){
    refreshRatio();
}
window.onhashchange=function(){
    refreshRatio();
}
//window.onscroll=function(){
//    refreshRatio();
//}