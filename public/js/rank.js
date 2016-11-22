/**
 * Created by taohailin on 2016/11/21.
 */
<!--<img src="${imgSrc}" style="display:${i>2?'none':'inlnie-block'}">-->
function updateRank(list,jq,tags) {//tags:0-点赞排行,1-评论排行,默认为0
    var frag=document.createDocumentFragment();
    for(var i in list){
        var imgSrc=list[i].imgURL||'../imgs/default_course.png';
        $(frag).append(`
             <li>
                <span>
                    <a href="data/detail.html" data-id="${list[i].objectId}">
                        ${i<3?'<img src="'+imgSrc+'">':""}
                        <span>${list[i].title}</span>
                    </a>
                </span>
                <span>${list[i].creator.username||list[i].creator.id}</span>
                <span>${list[i].tags||""}</span>
                <span class="${tags?'commentNum':'thumbUpNum'}">${tags?list[i]. commentNum:list[i]. thumbUpNum}</span>
            </li>
        `);
    }
    jq.html(frag);
}
$(function () {
    $.get('/v1/rank/thumbUp',function(data){
        if(data.result){
            updateRank(data.result,$('#rank .rankList ul'));
        }
    });
    //详情的跳转
    $('.rankList ul').on('click','a',function(e){
        e.preventDefault();
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        window.sessionStorage.removeItem('assign');
        $('.content').load($(this).attr('href'));
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