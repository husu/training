/**
 * Created by Taohailin on 2016/10/19.
 */
//标签导航
$('.tabs a').click(function (e) {
    e.preventDefault();
    $('.tabs a').removeClass();
    $(this).addClass('active-tabs');
    $($(this).attr('href')).show().siblings().hide();
});
//updateDOM
function upDate(list){
    var frag=document.createDocumentFragment();
    for(var i in list){
        var time=list[i].trainDate.iso;time=time.slice(0,19).replace('T'," ");
        $(frag).append(`
            <dl>
                <dt><a href="#"><img src=${list[i].imgURL}/><\/a><\/dt>
                <dd>${list[i].title}</dd>
                <dd>时间：${time}</dd>
                <dd>主讲：${list[i].creator.className}</dd>
            </dl>
        `);
    }
    $('#courses>div').html(frag);
}
var page=0;
$(function(){
    page=1;
    $.get('v1/training/list?page=1&&pageSize=6',function(data){
        console.log(data);
        upDate(data.result);
    });
});
$('.pages a').click(function (e) {
    e.preventDefault();
    var that=$(this);
    if(that.html()=="下一页"){
        page+=1;
        var that=$(this);
        $.get('v1/training/list?pageSize=6&&page='+page, function (data) {
            if(data.result){
                that.prev().show();
                upDate(data.result);
               data.result.length<6&&that.hide();
            }else{page-=1;that.hide();};
        });
    }else {
        page -= 1;
        $.get('v1/training/list?pageSize=6&&page=' + page, function (data) {
            upDate(data.result);
            that.next().show();
        });
        if (page == 1) {that.hide();}
    }
});