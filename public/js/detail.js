/**
 * Created by Taohailin on 2016/10/26.
 */
var resname=null;//回复谁的评论
var comments={page:1,pageSize:6};//查看更多评论
var commentNum=null;//评论数
var thumbUpNum=null;//点赞数
var replay={content:"",replayWho:""};//回复评论参数
var tags=window.sessionStorage.getItem('assign');//详情类别
var trainId=window.sessionStorage.getItem('train_id');//培训id
//update detail
function updateDetail(res,tags){
    var userClass='';
    var timeClass='';
    var time=preTime(res.trainDate||res.createdAt,true);
    switch(tags){
        case '1' :
            userClass='主讲人：';timeClass='创建时间：';break;
        case '2':
            userClass='创建人：';timeClass='创建时间：';break;
        default:
            userClass='主讲人：';timeClass='培训时间：';break;
    }
    $('.detail>div').html(`
        <div>
            <div class="lf"><img src="${res.imgURL||'../imgs/default_course.png'}" alt=""/></div>
            <div class="rt">
                <h3>${res.title}</h3>
                <p>${userClass+res.creator.nickName}</p>
                <p>${timeClass+time}</p>
                <div>${res.content}</div>
            </div>
        </div>
    `);
}
//update comments
function updateComment(list,jq){
    var frag=document.createDocumentFragment();
    for(var i in list){
        $(frag).append(`
           <div>
            <img src="../imgs/user.png" alt=""/>
            <div class="rt">
                <p><span>${list[i].creator.nickName}</span>&nbsp;&nbsp;&nbsp;&nbsp;${preTime(list[i].createdAt)}</p>
                <ul>
                    ${list[i].replayWho?('<li style="border-left:2px solid #ddd">'+list[i].replayWho+'</li>'):""}
                    <li>${list[i].content}</li>
                    <li><a href="${list[i].creator.nickName}">回&nbsp;应</a></li>
                </ul>
            </div>
        </div>
        `);
    }
    jq.html(frag);
}
$(function(){
    //页面初始化
    if(tags){
        $('#date').jeDate({
            skinCell:"jedateblue",
            format: 'YYYY-MM-DD hh:mm',
            isinitVal:'2016-10-1 09:00',
            minDate:$.nowDate(0),
            isTime:true,
            choosefun:function (inp,val) {
                $('#confirm').removeClass('btn-disable');
                $.get('v1/training/trainByTime',{trainDate:val+':00'},function(data){
                    if(!data.result){
                        var plan={objectId:trainId,trainDate:val+':00'};
                        $('#date').prev().html('');
                        $('#confirm').click(function(e){
                            e.preventDefault();
                            $.post('/v1/training/plan',plan,function(data){
                                if(data.result){
                                    $('#date').prev().html('安排成功').removeClass().addClass('succ');
                                    $('#confirm').addClass('btn-disable');
                                }
                            });
                        });
                    }else{
                        $('#date').prev().html('该时间已有培训').removeClass().addClass('err');
                    }
                });
            }
        });
        $('#train_assign').css('display','block');
    }
    $.get(`v1/training/detail/${trainId}`,function(data){
        var res=data.result;
        if(res.length||res){
            updateDetail(res,tags);
            commentNum=res.commentNum||0;
            thumbUpNum=res.thumbUpNum||0;
            $('.detail a:first').find('b').html(thumbUpNum);
            $('.detail a:last').find('b').html(commentNum);
            selectPage(`v1/comments/list/${trainId}`,comments,updateComment,$('.comment'),'','',commentNum);
        }
    });
    $.get(`v1/thumbUp/${trainId}`,function(data){
        data.result||$('.detail a:first').addClass('a-disable');
    });
    //分页查询评论
    $('#resList>p a').click(function (e) {
        e.preventDefault();
        selectPage(`v1/comments/list/${trainId}`,comments,updateComment,$('.comment'),'',$(this),commentNum);
    });
    //点赞
    $('.detail #praise').click(function (e) {
        e.preventDefault();
        var that=$(this);
        $.post(`v1/thumbUp/${trainId}`,function (data) {
            if(data.result) {
                thumbUpNum+=1;
                that.addClass('a-disable praise');
                that.find('b').html(thumbUpNum);
            }
        });
    });
    //评论或回复
    //点击评论
    $('.detail #review').click(function (e) {
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
                    commentNum+=1;
                    $('.detail a:last').find('b').html(commentNum);
                    selectPage(`v1/comments/list/${trainId}`,comments,updateComment,$('.comment'),'','',commentNum);
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
