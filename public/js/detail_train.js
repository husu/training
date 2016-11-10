/**
 * Created by Taohailin on 2016/10/26.
 */
var resname=null;//回复谁的评论
var comments={page:1,pageSize:6};//查看更多评论
var replay={content:"",replayWho:""};//评论参数
//update detail
function updateDetail(res){
    $('.detail').prepend(`
        <div>
            <div class="lf"><img src="${res.imgURL||'../imgs/default_course.png'}" alt=""/></div>
            <div class="rt">
                <h3>${res.title}</h3>
                <p>主讲人：${res.creator.username}&nbsp;&nbsp;时间：${preTime(res.trainDate||res.createdAt,true)}</p>
                <div>${res.content}</div>
            </div>
        </div>
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
    $('.comment>p').before(frag);
}
$(function(){
    //页面初始化
    username=window.sessionStorage.getItem('parsec_user');
    username&&$('nav a:last').html(username);
    trainId=window.sessionStorage.getItem('train_id');
    if(window.sessionStorage.getItem('assign')){
        $('#date').jeDate({
            skinCell:"jedateblue",
            format: 'YYYY-MM-DD hh:mm',
            isinitVal:'2016-10-1 09:00',
            minDate:$.nowDate(0),
            isTime:true,
            choosefun:function (inp,val) {
                $.get('v1/training/trainByTime',{trainDate:val+':00'},function(data){
                    if(!data.result){
                        var plan={objectId:trainId,trainDate:val+':00'};
                        $('#date').prev().html('');
                        $('#confirm').removeClass('btn-disable').click(function(e){
                            e.preventDefault();
                            var that=$(this);
                            $.post('/v1/training/plan',plan,function(data){
                                if(data.result){
                                    $('#date').prev().html('安排成功');
                                    that.addClass('btn-disable');
                                }
                            });
                        });
                    }else{$('#date').prev().html('该时间已有培训')}
                });
            }
        });
        $('#train_assign').show();
    }
    $.get(`v1/training/detail/${trainId}`,function(data){
        var res=data.result;
        if(res.length||res){
            updateDetail(res);
            $('.detail a:first').find('b').html(res.thumbUpNum);
            $('.detail a:last').find('b').html(res.commentNum);
        }
    });
    $.get(`v1/comments/list/${trainId}`,comments,function(data){
        if(data.result){
            updateComment(data.result);
            data.result.length<6&&$('.comment>p').hide();
        }
    });
    $.get(`v1/thumbUp/${trainId}`,function(data){
        data.result||$('.detail a:first').addClass('a-disable');
    });
    //查看更多评论
    $('.comment>p a').click(function (e) {
        e.preventDefault();
        comments.page+=1;
        $.get(`v1/comments/list/${trainId}`,comments,function(data){
            if(data.result.length||data.result){
                updateComment(data.result);
                data.result.length<6&&$('.comment>p a').addClass('b-disable').html('没有更多评论');
            }
        });
    });
    //点赞
    $('.detail a:contains("点赞")').click(function (e) {
        e.preventDefault();
        var that=$(this);
        $.post(`v1/thumbUp/${trainId}`,function (data) {
            if(data.result) {
                that.addClass('a-disable praise');
                that.find('b').html(parseInt(that.find('b').html()) + 1);
            }
        });
    });
    //评论或回复
    //点击评论
    $('.detail a:contains("评论")').click(function (e) {
        e.preventDefault();
        $('#replayWho').html('课程');
        replay.replayWho="";
        $('body').stop().animate({scrollTop:$('.replay').offset().top},500);
        $('#resBox').focus();
    });
    //点击回应
    $('.comment').on('click','div a', function (e) {
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
                if(!data.code){
                    var elem=$('.detail b:last');elem.html(parseInt(elem.html())+1);
                    updateComment(data.result);
                }
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
