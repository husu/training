/**
 * Created by Taohailin on 2016/10/19.
 */
//update培训列表
function updateList(list){
    function strTwo(T){return (T+100+'').slice(1);}//格式化俩位数；
    var frag=document.createDocumentFragment();
    for(var i in list){
        var time=new Date(list[i].trainDate);
        var year=time.getFullYear()
        var month=strTwo(time.getMonth()+1);
        var date=strTwo(time.getDate());
        var hours=strTwo(time.getHours());
        var minute=strTwo(time.getMinutes());
        time=year+'年'+month+'月'+date+'日\t\t'+hours+':'+minute;
        $(frag).append(`
            <dl>
                <dt><a href="detail_train.html" target="_blank" data-id="${list[i].objectId}"><img src="${list[i].imgURL||'../imgs/default_course.png'}"/><\/a><\/dt>
                <dd>${list[i].title}</dd>
                <dd>时间：${time}</dd>
                <dd>主讲：${list[i].creator.username}</dd>
            </dl>
        `);
    }
    $('#courses .train_list').html(frag);
}
var pages={page:1,pageSize:6};//获取培训列表
var flag=false//是否有管理员权限
var username=window.sessionStorage.getItem('parsec_user');
$(function(){
    username?$('nav a:last').html(username):$('.modal').show();
    $.get('v1/training/list',pages,function(data){
                updateList(data.result);
    });
    //登录验证
    $('#login input[type="button"]').click(function(e){
        e.preventDefault();
        var obj=$('#login').serialize();
        $.post('/login',obj,function(data){
            if(data.result){
                window.sessionStorage.setItem('parsec_user',data.result.username);
                $('.modal').fadeOut('slow');
                $('nav a:last').html(data.result.username);
            }else{
                if(data.message){
                    $('.msg_login').html(data.message);
                }else{
                    $('.msg_login').html('用户名或密码错误');
                }
            }
        });
    });
    //标签导航
    $('.tabs a').click(function (e) {
        e.preventDefault();
        $('.tabs a').removeClass();
        $(this).addClass('active-tabs');
        $($(this).attr('href')).show().siblings().hide();
    });
    //分页查询
    $('.pages a').click(function (e) {
        e.preventDefault();
        var that=$(this);
        if(that.html()=="下一页"){
            pages.page+=1;
            $.get('v1/training/list',pages, function (data) {
                if(data.result.length!=0){
                    that.prev().show();
                    updateList(data.result);
                    data.result.length<6&&that.hide();
                }else{pages.page-=1;that.hide();};
            });
        }else {
            pages.page -= 1;
            $.get('v1/training/list',pages, function (data) {
                updateList(data.result);
                that.next().show();
            });
            if (pages.page==1) {that.hide();}
        }
    });
    //培训详情的跳转
    $('.train_list').on('click','a',function(){
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
    });
});
