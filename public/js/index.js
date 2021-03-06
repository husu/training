/**
 * Created by Taohailin on 2016/10/19.
 */
var pagesTrain={page:1,pageSize:12};//获取培训列表
var pagesList={page:1,pageSize:12};//获取需求意愿列表
var createUrl=null;//创建培训意愿或需求的请求url
var selectUrl=null;//查询的URL
//一个培训课程
function htmlFlat(list){
    var userClass='';
    var timeClass='';
    var tag='';
    var color='';
    switch(list.status){
        case 1 :
            userClass='主讲人：';timeClass='创建时间：';tag='讲';color='#FF6100';break;
        case 0:
            userClass='创建人：';timeClass='创建时间：';tag='听';color='#60BE29';break;
        default:
            userClass='主讲人：';timeClass='开坛时间：';break;
    }
    var time=preTime(list.trainDate||list.createdAt,true);
    return `
            <dl>
                <dt>
                    <a data-id="${list.objectId}" style="position:relative;display:inline-block;">
                        <img src="${list.imgURL||'../imgs/default_course.png'}" style="position:relative"/>
                        <span style="background:${color};position:absolute;top:1px;right:1px;color:#fff;padding:3px 5px;">${tag}</span>
                    <\/a>        
                <\/dt>
                <dd><a data-id="${list.objectId}">${list.title}</a></dd>
                <dd>${timeClass+time}</dd>
                <dd>${userClass+list.creator.nickName}</dd>
                <dd><span>${list.thumbUpNum||0}</span><span>${list.commentNum||0}</span></dd>
            </dl>
        `;
}
//更新培训查询列表
function updateList(list,jq){//list:列表,jq:父元素
    var frag=document.createDocumentFragment();
    for(var i in list){
        $(frag).append(htmlFlat(list[i]));
    }
    jq.html(frag);
}
$(function(){
    //标签导航
    $('.tabs li a').click(function (e) {
        e.preventDefault();
        var flag=false;
        var module=$(this).attr('href');
        $('.tabs a').removeClass();
        $(this).addClass('active-tabs');
        $(module).show().siblings('.module').hide();
        $('#add_train').show();
        if(!$(module).find('.list').html()){flag=true}else{
            var time=new Date().getTime();
            if((time%3)==2){flag=true;}
        }
        switch(module){
            case '#training':
                flag&&selectPage('v1/training/list',pagesTrain,updateList,$('#training .list'));break;
            case '#require':
                flag&&$('#require .all').addClass('active_mark').siblings().removeClass('active_mark')&&selectPage('/v1/training/noScheduled/all',pagesList,updateList,$('#require .list'));break;
            case '#rank':
                $('#add_train').hide();
                flag&&$.get('/v1/rank/thumbUp',function(data){
                    if(data.result){
                        updateRank(data.result,$('#rank .rankList .list'));
                    }
                });
        }
    });
    //添加培训
    $('#add_train a').click(function(e){
            e.preventDefault();
            createUrl=$(this).attr('data-url');
            $('.add_train').show().siblings('div').hide();
            $('.modal').not('.userLogin').fadeIn('slow');
            $('.default_img').hide();
            $('.modal-content>p').hide();
            $('#select').val('选择图片');
            $('#add')[0].reset();
        }
    );
    //选择图片
    $('#select').click(function (e) {
        e.preventDefault();
        $('.default_img').stop().slideToggle(500);
        $('#select').val('选择图片');
        $('#add input[type="hidden"]').val()&&($(this).siblings('img').attr('src',$('#add input[type="hidden"]').val()));
    });
    $('.default_img img').click(function () {
        $(this).css('border','3px solid green').siblings().css('border','3px solid #ddd');
        $('#add input[type="hidden"]').val($(this).attr('src'));
        $('#select').val('确认图片');
    });
    //提交新增培训
    $('.add_train input:last').click(function (e) {
        e.preventDefault();
        var res=$('#add').serialize();
        $.post(createUrl,res, function (data) {
            if(!data.code){
                $('.modal').fadeOut();
                $('#require .list').prepend(htmlFlat(data.result));
                $('.tabs a').removeClass();
                $('.tabs li:nth-child(2) a').addClass('active-tabs');
                $('#require').show().siblings('.module').hide();
            }else{$('.msg-add').html(data.errors).show();}
        });
    });
});
//英雄榜
function updateRank(list,jq,tags) {//tags:0-点赞排行,1-评论排行,默认为0---英雄榜updateDom
    var frag=document.createDocumentFragment();
    for(var i in list){
        $(frag).append(`
             <li>
                <span>
                    <a data-id="${list[i].objectId}">
                        <img src="${list[i].imgURL||'../imgs/default_course.png'}">
                        <span>${list[i].title}</span>
                    </a>
                </span>
                <span>${list[i].creator.nickName}</span>
                <span>${list[i].tags||"未知"}</span>
                <span class="${tags?'commentNum':'thumbUpNum'}">${tags?list[i]. commentNum||0:list[i]. thumbUpNum||0}</span>
            </li>
        `);
    }
    jq.html(frag);
}
$(function () {
    //详情的跳转
    $('.rankList ul').on('click','a',function(e){
        e.preventDefault();
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        $('#detail').empty().load('detail.html');
        $('.detail_box').show().prev().hide();
        $('body,html').stop().animate({scrollTop:0});
    });
    //排行分类
    $('.sort a:first').click(function(e){
        e.preventDefault();
        $.get('/v1/rank/thumbUp',function(data){
            if(data.result){
                updateRank(data.result,$('#rank .rankList ul'));
                $('.rankList>p').html('点赞榜');
            }
        });
    });
    $('.sort a:last').click(function(e){
        e.preventDefault();
        $.get('/v1/rank/comment',function(data){
            if(data.result){
                updateRank(data.result,$('#rank .rankList ul'),1);
                $('.rankList>p').html('热评榜');
            }
        });
    });

});
//资不资瓷
$(function () {
    //分页查询更多列表
    $('#require .pages a').click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        selectPage(selectUrl,pagesList,updateList,$('.list'),$(this));

    });
    //意愿需求详情
    $('#require .list').on('click','a',function(e){
        e.preventDefault();
        $(this).attr('data-id')&&window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        $('#detail').empty().load('detail.html');
        $('.detail_box').show().prev().hide();
        $('body,html').stop().animate({scrollTop:0});
    });
    //筛选
    $('.mark a').click(function(e){
        e.preventDefault();
        "use strict";
        var elem=$(this);
        elem.addClass('active_mark').siblings().removeClass('active_mark');
       if(elem.hasClass('all')){
           selectUrl='/v1/training/noScheduled/all';
       }else if(elem.hasClass('listen')){
           selectUrl='/v1/training/noScheduled/requirement';
       }else{
           selectUrl='/v1/training/noScheduled/willingness';
       }
        selectPage(selectUrl,pagesList,updateList,$('#require .list'));
    });
});
//教你做人
$(function(){
    //分页查询
    $('#training .pages a').click(function (e) {
        e.preventDefault();
        selectPage('v1/training/list',pagesTrain,updateList,$('#training .train_list'),$(this));
    });
    //培训详情的跳转
    $('#training  .train_list').on('click','a',function(e){
        e.preventDefault();
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        $('#detail').empty().load('detail.html');
        $('.detail_box').show().prev().hide();
        $('body,html').stop().animate({scrollTop:0});
    });
});


