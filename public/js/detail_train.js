/**
 * Created by Taohailin on 2016/10/26.
 */
var trainId=null;//培训id
var resname=null;//回复谁的评论
var username=null//用户名
var replay={content:"",replayWho:""}//评论参数
//时间格式化 t:任意时间格式 f:默认为flase  yy-mm-dd，true yy年mm月dd日;
function preTime(t,f){
    function strTwo(T){return (T+100+'').slice(1);}
    var time=new Date(t);
    var year=time.getFullYear()
    var month=strTwo(time.getMonth()+1);
    var date=strTwo(time.getDate());
    var hours=strTwo(time.getHours());
    var minute=strTwo(time.getMinutes());
    return f?(year+'年'+month+'月'+date+'日\t\t'+hours+':'+minute):(year+'-'+month+'-'+date+'\t\t'+hours+':'+minute);
}
//update detail
function updateDetail(res){
    $('.detail').html(`
        <div>
            <div class="lf"><img src="${res.imgURL||'../imgs/default_course.png'}" alt=""/></div>
            <div class="rt">
                <h3>${res.title}</h3>
                <p>主讲人：${res.creator.username}&nbsp;&nbsp;培训时间：${preTime(res.trainDate,true)}</p>
                <p>${res.content}</p>
            </div>
        </div>
        <p><a href="#" class="praise-def">点赞<b>${res.thumbUpNum}<\/b><\/a><a href="#">评论<b>${res.commentNum}<\/b><\/a></p>
    `);
}
//update comments
function updateComment(list){
    var frag=document.createDocumentFragment();
    for(var i in list){
        $(frag).append(`
           <div>
            <img src="../imgs/user.png" alt=""/>
            <div class="rt">
                <p><span>${list[i].creator.username}</span>&nbsp;&nbsp;&nbsp;&nbsp;${preTime(list[i].createdAt)}</p>
                <ul>
                    ${list[i].replayWho?('<li style="border-left:2px solid #ddd">'+list[i].replayWho+'</li>'):""}
                    <li>${list[i].content}</li>
                    <li><a href="${list[i].creator.username}">回&nbsp;应</a></li>
                </ul>
            </div>
        </div>
        `);
    }
    $('.comment').append(frag);
}
$(function(){
    //页面初始化
    username=window.sessionStorage.getItem('parsec_user');
    username&&$('nav a:last').html(username);
    trainId=window.sessionStorage.getItem('train_id');
    $.get(`v1/training/detail/${trainId}`,function(data){
        updateDetail(data.result);
    });
    $.get(`v1/comments/list/${trainId}`,{page:1,pageSize:10},function(data){
        updateComment(data.result);
    });
    //点赞
    $('.detail').on('click', 'a:contains("点赞")', function (e) {
        e.preventDefault();
        var that=$(this);
        $.get(`v1/thumbUp/${trainId}`,function (data) {
            if (!data.result) {
                console.log(data);
                $.post(`v1/thumbUp/${trainId}`,function (data) {

                    if(!data.code){
                        that.attr('class','praise');
                        that.find('b').html(data.result.thumbUpNum);
                    }
                });
            }else{that.addClass('a-disable');}
        });
    });
    //评论或回复
    //点击评论
    $('.detail').on('click', 'a:contains("评论")', function (e) {
        e.preventDefault();
        $('#replayWho').html('课程');
        replay.replayWho="";
        $('body').stop().animate({scrollTop:$('.replay').offset().top},1000);
        $('#resBox').focus();
    });
    //点击回应
    $('.comment').on('click','a', function (e) {
        e.preventDefault();
        resname=$(this).attr('href');
        $('#replayWho').html(resname);
        replay.replayWho=$(this).parent().prev().html().slice(0,40)+'\t\t@'+resname;
        $('body').stop().animate({scrollTop:$('.replay').offset().top},1000);
        $('#resBox').focus();
    });
    //点击切换默认回复对象
    $('.replay a:first').click(function (e) {
        e.preventDefault();
        $(this).html('课程');
        replay.replayWho="";
    });
    //点击回复
    $('.replay a:last').click(function (e) {
        e.preventDefault();
        replay.content=$('#resBox').val();
        if(replay.content){
            $.post(`v1/comments/${trainId}`,replay, function (data) {
                reMsg(data.message);
                $('#resBox').val("");
            });
        }else{reMsg('回复内容不能为空')}
        //回复提示信息
        function reMsg(txt){
            $('#msg').html(txt).fadeIn('slow', function () {
                setTimeout(function () {
                    $('#msg').fadeOut();
                }, 1000);
            });
        }
    });
});
