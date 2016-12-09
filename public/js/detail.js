/**
 * Created by Taohailin on 2016/10/26.
 */
var resname=null;//回复谁的评论
var comments={page:1,pageSize:15};//查看更多评论
var commentNum=null;//评论数
var thumbUpNum=null;//点赞数
var replay={content:"",replayWho:"",recipient:[]};//回复评论参数
var trainId=window.sessionStorage.getItem('train_id');//培训id
var authorId='';//作者id
var tags=false;//是否需要安排培训
var needUpNum=6;//满足安排培训的点赞数
//update detail
function updateDetail(res){
    var userClass='';
    var timeClass='';
    var time=preTime(res.trainDate||res.createdAt,true);
    switch(res.status){
        case 1:
            userClass='主讲人：';timeClass='创建时间：';tags=true;break;
        case 0:
            userClass='创建人：';timeClass='创建时间：';tags=true;break;
        default:
            userClass='主讲人：';timeClass='开坛时间：';break;
    }
    $('.detail .content').html(`
        <div>
            <div class="lf"><img src="${res.imgURL||'../imgs/default_course.png'}" alt=""/></div>
            <div class="rt">
                <h3>${res.title}</h3>
                <p>${userClass+(res.creator.nickName||res.creator.username)}</p>
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
            <img src="${list[i].creator.icon||'../imgs/user.png'}" style="width:75px; height:75px;"/>
            <div class="rt">
                <p><span>${list[i].creator.nickName}</span>&nbsp;&nbsp;&nbsp;&nbsp;${preTime(list[i].createdAt)}</p>
                <ul>
                    ${list[i].replayWho?('<li style="border-left:2px solid #aaa;color:#888">'+list[i].replayWho+'</li>'):""}
                    <li>${list[i].content}</li>
                    <li><a data-userName="${list[i].creator.nickName||res.creator.username}" data-userId="${list[i].objectId}">回&nbsp;应</a></li>
                </ul>
            </div>
        </div>
        `);
    }
    jq.html(frag);
}
$(function(){
    //提示信息
    function reMsg(txt){
        $('.msg-prompt').html(txt).slideDown('fast', function () {
            setTimeout(function () {
                $('.msg-prompt').slideUp();
            },1500);
        });
    }
    //选择时间后的处理
    function selectTime(val) {
        $('#confirm').removeClass('btn-disable');
        // console.log('inp:' + inp + 'val:'+ val);
        $.get('v1/training/trainByTime',{trainDate:val},function(data){
            if(!data.result){
                var plan={objectId:trainId,trainDate:val};
                $('#confirm').click(function(e){
                    e.preventDefault();
                    $('.msg-confirm').slideDown('',function(){
                        "use strict";
                        $('body').click(function(){return false});
                        $('.ok').click(function(e){
                            $('.msg-confirm').slideUp();
                            e.preventDefault();
                            $.post('/v1/training/plan',plan,function(data){
                                if(data.result){
                                    reMsg('安排成功');
                                    $('#confirm').addClass('btn-disable');
                                }else{reMsg('安排失败');}
                            });
                        });
                        $('.cancel').click(function(e){
                            e.preventDefault();
                            $('.msg-confirm').slideUp();
                        });
                    });
                });
            }else{
                reMsg('该时间已经有培训课程');
            }
        });
    }
    //页面初始化
    $.get(`v1/training/detail/${trainId}`,function(data){
        var res=data.result;
        authorId=res.creator.objectId;
        replay.recipient=authorId;
        if(res.length||res){
            updateDetail(res);
            commentNum=res.commentNum||0;
            thumbUpNum=res.thumbUpNum||0;
            if(tags){
                $('.needUpNum').show();
                $('#date').jeDate({
                    skinCell:"jedateblue",
                    format: 'YYYY-MM-DD hh:mm',
                    isinitVal:'2016-10-1 09:00',
                    minDate:$.nowDate(0),
                    festival: true,
                    isTime:true,
                    okfun:function (inp,val) {selectTime(val);},
                    choosefun:function (inp,val) {selectTime(val);}
                });
                (thumbUpNum>=needUpNum)&&$('#train_assign').show()&&$('.needUpNum').hide();
            }

            $('#praise').find('b').html(thumbUpNum);
            $('#review').find('b').html(commentNum);
            selectPage(`v1/comments/list/${trainId}`,comments,updateComment,$('.comment'),'',commentNum);
        }
    });
    $.get(`v1/thumbUp/${trainId}`,function(data){
        data.result||$('#praise').addClass('a-disable');
    });
    //分页查询评论
    $('#resList>p a').click(function (e) {
        e.preventDefault();
        selectPage(`v1/comments/list/${trainId}`,comments,updateComment,$('.comment'),$(this),commentNum);
    });
    //点赞
    $('#praise').click(function (e) {
        e.preventDefault();
        var that=$(this);
        $.post(`v1/thumbUp/${trainId}`,function (data) {
            if(data.result) {
                thumbUpNum+=1;
                if(tags&&(thumbUpNum<needUpNum)){
                    reMsg('点赞成功!!还差'+(needUpNum-thumbUpNum)+'赞开坛!');
                }else{ reMsg('点赞成功!!!');}
                tags&&(thumbUpNum>=needUpNum)&&$('#train_assign').show()&&$('.needUpNum').hide();
                that.addClass('a-disable praise');
                that.find('b').html(thumbUpNum);
            }
        });
    });
    //评论或回复
    //点击评论
    $('#review').click(function (e) {
        e.preventDefault();
        $('#replayWho').html('课程');
        replay.replayWho="";
        replay.recipient=[authorId];
        $('html,body').stop().animate({scrollTop:$('.replay').offset().top},500);
        $('#resBox').focus();
    });
    //点击回应
    $('.comment').on('click','div a', function (e) {
        e.preventDefault();
        resname=$(this).attr('data-userName');
        replay.recipient=[authorId,$(this).attr('data-userId')];
        replay.replayWho=$(this).parent().prev().html().slice(0,40)+'\t\t@'+resname;
        $('#replayWho').html(resname);
        $('html,body').stop().animate({scrollTop:$('.replay').offset().top},500);
        $('#resBox').focus();
    });
    //点击切换默认回复对象
    $('.replay a:first').click(function (e) {
        e.preventDefault();
        $(this).html('课程');
        replay.replayWho="";
        replay.recipient=[authorId];
    });
    //点击回复
    $('.replay a:last').click(function (e) {
        e.preventDefault();
        var that=$(this);
        that.addClass('btn-disable');
        replay.content=$('#resBox').val();
        if(replay.content){
            $.post(`v1/comments/${trainId}`,replay, function (data) {
                reMsg(data.message);
                $('#resBox').val("");
                if(!data.code){
                    commentNum+=1;
                    that.removeClass('btn-disable');
                    $('#review').find('b').html(commentNum);
                    selectPage(`v1/comments/list/${trainId}`,comments,updateComment,$('.comment'),'',commentNum);
                }
            });
        }else{reMsg('回复内容不能为空');that.removeClass('btn-disable');}
    });
});
