const [cpW, cpH, mapW, mapH] = [600, 500, 30, 25];//画布大小 坐标
const scores = [1,3,5,10,-3];
var game = {name : null,score : 0 , lengths : 0, record : 0 ,speed : 130,time : 100, rank : 0};//游戏数据 得分 长度 历史最高分 速度（插入时间） 存在时间
var sn = [2, 1], dz = 3, sz =-1,nth ,fx=1, n, barrers = [],snake;//sn蛇 barrers障碍物 dz普通食物 sz超级食物
var ctx=document.getElementById("cPanel").getContext("2d");
var appearTime = disappearTime =  0;// 超级食物出现
var colors = ["#ff3300","#33cc33","#99ff66","#ffff00","#6495ED","#ffffff"];
var snakecolors = ["#FFBBFF","#FF00FF","#1E90FF","#473C8B","#7CFC00","#54FF9F"];
var ylogin;
function $(id){return document.getElementById(id);}
function saveToStorage(notes){localStorage.setItem("login",JSON.stringify(notes));}
function init(){
    ylogin = JSON.parse(localStorage.getItem("login"))||{};
    if(ylogin !=null){
        for(var name in ylogin){
        if(ylogin.hasOwnProperty(name)){
            $("myname").style.display="";
            $("arank").style.display="";
            $("myname").innerHTML = name;
            $("areg").style.display="none";
            $("alogin").style.display="none";
            if(ylogin[name][1]>game.record)
                game.record = ylogin[name][1];
            game.name = name;
            game.rank = ylogin[name][2];
            break;
        }    
        }
    }
    var proPanel = [];// 提示面板
    $("scoreDiv").innerHTML = "得分："+game.score+"<br/><br/>长度："+ game.lengths+"<br/><br/>"+"历史最高：<br/>"+game.record+"<br/> 排名："+game.rank;
    proPanel.push("<table>");
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor="Black"></td>' + '<td>&nbsp中毒状态下得分为1</td>'+'</tr>');
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor='+colors[0]+'></td>' + '<td>&nbsp得分+ 1</td>'+'</tr>');
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor='+colors[1]+'></td>' + '<td>&nbsp得分+ 3</td>'+'</tr>');
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor='+colors[2]+'></td>' + '<td>&nbsp得分+ 5</td>'+'</tr>');
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor='+colors[3]+'></td>' + '<td>&nbsp得分+10</td>'+'</tr>');
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor='+colors[4]+'></td>' + '<td>&nbsp得分-3</td>'+'</tr>');
    proPanel.push('<tr>'+'<td width="20px" height="20px" bgcolor='+colors[5]+'></td>' + '<td>&nbsp神秘奖励</td>');
    proPanel.push("</table>");
    $("prompt").innerHTML = proPanel.join("");
    ctx.font="30px Verdana";
    // 创建渐变
    var gradient=ctx.createLinearGradient(0,0,cpW-180,0);
    gradient.addColorStop("0","magenta");
    gradient.addColorStop("0.5","blue");
    gradient.addColorStop("1.0","red");
    // 用渐变填色
    ctx.fillStyle=gradient;
    ctx.drawImage($("maintu"),0,0,cpW,cpH);
    ctx.fillText("我的贪吃蛇小游戏",180,450);    
}
function draw(t,c){
    ctx.fillStyle=c;
    ctx.fillRect(t%mapW*20+1,~~(t/mapW)*20+1,18,18);
}
function clearPanel(){
    ctx.fillStyle="Black";
    ctx.fillRect(0,0,cpW,cpH);
}
function barrer(){
    var passValue = $('pass').value;
    clearPanel();  
    switch(passValue){
        case "1":barrers = [];break;
        case "2":
            barrers = [109,110,111,112,138,167,197,227,382,412,442,472,502,617];
            for(var i =0;i<16;i++){
                barrers.push(98+30*i);                                
            }
            for(var i =0;i<2;i++){
                barrers.push(513+30*i);
                barrers.push(544+30*i);
                barrers.push(575+30*i);
                barrers.push(576+30*i);
                barrers.push(547+30*i);
                barrers.push(258+30*i);
                barrers.push(289+30*i);
                barrers.push(320+30*i);
                barrers.push(351+30*i);
                barrers.push(501+30*i);
                barrers.push(530+30*i);
                barrers.push(559+30*i);
                barrers.push(588+30*i);
            }
            break;
        case "3":
            barrers = [344,345,372,373,374,375,376,377,404,405];
            for(var i =0;i<7;i++){
                barrers.push(10+30*i);
                barrers.push(19+30*i);
                barrers.push(580+30*i);
                barrers.push(589+30*i);
                barrers.push(240+i);
                barrers.push(480+i);
                barrers.push(263+i);
                barrers.push(503+i);
            }
        break;
        default:break;
    }
    for(var i in barrers){
        draw(barrers[i],"#F0F0F0");
    }
}  
function appear(){
    if(sz !=-1) return;
    while(sn.indexOf(sz=~~(Math.random()*mapH*mapW))>=0||barrers.indexOf(sz)>=0||sz==dz);
    nth = Math.floor(Math.random(10)*10);
    // nth = 10;
    if(nth < 3){nth=1;draw(sz,colors[1]);}
    else if(3 <= nth && nth < 5){nth=2;draw(sz,colors[2]);}
    else if(5 <= nth && nth < 7){nth=3;draw(sz,colors[3]);}
    else if(7 <= nth && nth < 9){nth=4;draw(sz,colors[4]);}
    else {nth=5;draw(sz,colors[5]);}
    // 一定时间后超级食物消失
    disappearTime = setTimeout(function(){disappear();},game.time*80);
};
function disappear(){
    if(sz == -1) return;
    draw(sz,"Black");
    sz = -1;
    superFood();
};
function superFood(){
    appearTime = setTimeout(function(){appear();},game.time*50);
}
var snake_nor =function(){};
snake_nor.prototype.eating = function(n){
    draw(n,"Lime");
    if(n==dz){
        game.score += 1;
        while(sn.indexOf(dz=~~(Math.random()*mapH*mapW))>=0||barrers.indexOf(dz)>=0);
        draw(dz,colors[0]);
    }
    else if(n==sz){
        sz = -1;
        clearTimeout(disappearTime);
        if(nth == 5){
            nth = Math.floor(Math.random(10)*2);
            if(nth == 0){
                game.score += Math.floor(Math.random(50)*50)-20;
            }else{
                ispoi(true);
            }
        }else{
            game.score +=scores[nth];
        }
        superFood();
    }
    else
        draw(sn.pop(),"Black");
}
snake_nor.prototype.onkeyhappen = function(e){
    fx=sn[1]-sn[0]==(n=[-1,-mapW,1,mapW][(e||event).keyCode-37]||fx)?fx:n
};
var snake_poi = function(){}
snake_poi.prototype.eating = function(n){
    var t = ~~(Math.random()*5);
    draw(n,snakecolors[t]);
    if(n==dz){
        game.score += 1;
        while(sn.indexOf(dz=~~(Math.random()*mapH*mapW))>=0||barrers.indexOf(dz)>=0);
        draw(dz,colors[0]);//食物
        ispoi(false);
    }
    else if(n==sz){
        sz = -1;
        clearTimeout(disappearTime);
        game.score += 1;
        ispoi(false);
        superFood();
    }
    else
        draw(sn.pop(),"Black");
}
snake_poi.prototype.onkeyhappen = function(e){
    fx=sn[1]-sn[0]==(n=[1,mapW,-1,-mapW][(e||event).keyCode-37]||fx)?fx:n;
}
function ispoi(is){
    if(is)snake = new snake_poi();
    else snake = new snake_nor();
    document.onkeydown=snake.onkeyhappen;
}
snake = new snake_nor();
document.onkeydown=snake.onkeyhappen;
var startGame = function(){
    game.lengths = sn.length;
    $("scoreDiv").innerHTML = "得分："+game.score+"<br/><br/>长度："+ game.lengths+"<br/><br/>"+"历史最高：<br/>"+game.record;
    sn.unshift(n=sn[0]+fx);
    //游戏结束
    if(sn.indexOf(n,1)>0 || barrers.indexOf(n,0)>=0 || n<0||n>mapH*mapW-1||fx==1&&n%mapW==0||fx==-1&&(n+1)%mapW==0){
        clearTimeout(appearTime); clearTimeout(disappearTime);
        var res = "游戏结束!<br/>";
        if(game.score > game.record){
            res += "恭喜你破纪录啦！<br/>";
            game.record = game.score;
            ylogin[game.name][1] = game.record;
            saveToStorage(ylogin);
        }
        res += "您的得分为：" + game.score + "<br/>长度:"+game.lengths;
        $("result").style.display = "inline";
        $("result").innerHTML = res;
        $("restart").disabled = false;
        return;
    }    
    snake.eating(n);
    setTimeout(function(){startGame();},game.speed);
};
function start(){
    if(!game.name){
        alert("请先登录！");
        return;
    }
    clearTimeout(appearTime); clearTimeout(disappearTime);
    $("pass").disabled = true;
    $("rate").disabled = true;
    $("start").disabled = true;
    game.speed = $('rate').value;
    barrer();
    startGame();
    superFood();
}
function restart(){
    $("pass").disabled = false;
    $("rate").disabled = false;
    $("start").disabled = false;
    $("restart").disabled = true;
    $("result").style.display = "none";
    barrer();
    game.lengths = 0;
    game.score = 0;
    sn = [2, 1], dz = 3, sz =-1 ,fx=1 ,n =-1;
    $("scoreDiv").innerHTML = "得分："+game.score+"<br/><br/>长度："+ game.lengths+"<br/><br/>"+"历史最高：<br/>"+game.record;
}