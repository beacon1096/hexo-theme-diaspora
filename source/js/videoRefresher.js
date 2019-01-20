function refreshRatio(){
    //var video = document.getElementById("Video");
    var video = document.getElementsByClassName("VideoPlayer");
    if(video==null)alert("No Video!");
    var article =document.getElementById("article");
    var ratio = 1;
    for(let i=0;i<video.length;i++){
        video[i].style.height = Math.floor(ratio*article.clientWidth/16*11)+"px";       
    }
    console.log("ratio:"+ratio+",height->"+Math.floor(ratio*article.clientWidth/16*11)+"px");
}
refreshRatio();
window.onresize=function(){
            refreshRatio();
    }