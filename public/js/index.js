/**
 * Created by Taohailin on 2016/10/19.
 */
//update培训列表
function updateList(list){
    var frag=document.createDocumentFragment();
    for(var i in list){
        var time=list[i].trainDate.iso;time=time.slice(0,19).replace('T'," ");
        $(frag).append(`
            <dl>
                <dt><a href="${list[i].objectId}"><img src="${list[i].imgURL||'../imgs/default_course.png'}"/><\/a><\/dt>
                <dd>${list[i].title}</dd>
                <dd>时间：${time}</dd>
                <dd>主讲：${list[i].creator.className}</dd>
            </dl>
        `);
    }
    $('#courses .train_list').html(frag);
}
//update培训详情
function updateDetail(){}
var pages={page:1,pageSize:6};//获取培训列表
var flag=false//是否有管理员权限
$(function(){
    //登录验证
    $('#login input[type="button"]').click(function(e){
        e.preventDefault();
        var obj=$('#login').serialize();
        $.post('/login',obj,function(data){
            $('.modal').fadeOut('slow');//测试用
            window.sessionStorage.setItem('parsec_user','taohailin');
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
    $(document).ready(
        function(){
            window.sessionStorage.getItem('parsec_user')&&$('.modal').hide();
            var json=JSON.stringify(pages);
            $.ajax({
                type:'GET',
                url:'v1/training/list',
                data:json,
                contentType:'application/json',
                success:function(data){
                    updateList(data.result);
                }
            });
        }
    );
    $('.pages a').click(function (e) {
        e.preventDefault();
        var that=$(this);
        if(that.html()=="下一页"){
            page+=1;
            $.get('v1/training/list?pageSize=6&&page='+page, function (data) {
                if(data.result.length!=0){
                    that.prev().show();
                    updateList(data.result);
                    data.result.length<6&&that.hide();
                }else{page-=1;that.hide();};
            });
        }else {
            page -= 1;
            $.get('v1/training/list?pageSize=6&&page=' + page, function (data) {
                updateList(data.result);
                that.next().show();
            });
            if (page == 1) {that.hide();}
        }
    });
    //培训详情

});
