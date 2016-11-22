/**
 * Created by Taohailin on 2016/10/19.
 */
var username=window.sessionStorage.getItem('parsec_user');//是否登录
var user=JSON.parse(window.localStorage.getItem('parsec_user'));//记住用户密码
//时间格式化方法 t:任意时间格式 f:默认为flase  yy-mm-dd，true yy年mm月dd日;
function preTime(t,f){
    function strTwo(T){return (T+100+'').slice(1);}//格式化两位数字;
    var time=new Date(t);
    var year=time.getFullYear();
    var month=strTwo(time.getMonth()+1);
    var date=strTwo(time.getDate());
    var hours=strTwo(time.getHours());
    var minute=strTwo(time.getMinutes());
    return f?(year+'年'+month+'月'+date+'日\t\t'+hours+':'+minute):(year+'-'+month+'-'+date+'\t\t'+hours+':'+minute);
}
//分页查询//fun-dom更新函数,jq-列表父元素,tags:1-willing,2-require,that-分页按钮,num:列表条数
function selectPage(url,pages,fun,jq,tags,that,num){
    var totalPage=null;
    num&&(totalPage=Math.ceil(num/pages.pageSize));
    if(!that){
        $.get(url,pages,function (data) {
            if(data.result){
                if(totalPage!=1&&(pages.page>1||data.result.length>=pages.pageSize)){
                    jq.siblings('.pages').show();
                }
                if(totalPage!=pages.page){
                    $('.pages a:contains("末页"),.pages a:contains("下一页")').removeClass('a-disable');
                }
                if(tags){jq.parent().show();}
                fun(data.result,jq,tags);
            }

        });
        return;
    }
    if(that.html()=="下一页"){
        $('.pages a:contains("首页"),.pages a:contains("上一页")').removeClass('a-disable');
        pages.page+=1;
    }else if(that.html()=="上一页") {
        $('.pages a:contains("末页"),.pages a:contains("下一页")').removeClass('a-disable');
        pages.page-=1;
    }else if(that.html()=="首页"){
        pages.page=1;
    }else{
        pages.page=totalPage;
    }
    $.get(url,pages, function (data) {
        if(data.result.length){
            if(pages.page==1){
                $('.pages a:contains("首页"),.pages a:contains("上一页")').addClass('a-disable');
                $('.pages a:contains("末页"),.pages a:contains("下一页")').removeClass('a-disable');
            }
            if(pages.page==totalPage||data.result.length<pages.pageSize){
                $('.pages a:contains("末页"),.pages a:contains("下一页")').addClass('a-disable');
                $('.pages a:contains("首页"),.pages a:contains("上一页")').removeClass('a-disable');
            }
            fun(data.result,jq,tags);
        }else{//下一页数据为空
            pages.page-=1;
            if(pages.page!=1){
                $('.pages a:contains("末页"),.pages a:contains("下一页")').addClass('a-disable');
                $('.pages a:contains("首页"),.pages a:contains("上一页")').removeClass('a-disable');
            }else{that.parent().hide();}
        }
    });
}
//更新培训查询列表
function updateList(list,jq,tags){//list:列表,jq:父元素,tags:1-willing,2-require,
    var frag=document.createDocumentFragment();
    var userClass='';
    var timeClass='';
    switch(tags){
        case 1 :
            userClass='主讲人：';timeClass='创建时间：';break;
        case 2:
            userClass='创建人：';timeClass='创建时间：';break;
        default:
            userClass='主讲人：';timeClass='时间：';break;
    }
    for(var i in list){
        var time=preTime(list[i].trainDate||list[i].createdAt,true);
        $(frag).append(`
            <dl>
                <dt><a href="data/detail.html" data-id="${list[i].objectId}"><img src="${list[i].imgURL||'../imgs/default_course.png'}"/><\/a><\/dt>
                <dd>${list[i].title}</dd>
                <dd>${timeClass+time}</dd>
                <dd>${userClass+list[i].creator.username}</dd>
            </dl>
        `);
    }
    jq.html(frag);
}
$(function(){
    if(username){
        $('nav .user').html(username);
        $('.module').load('data/main.html');
        setTimeout(function(){
            $('header').slideUp(500);
        },1500);
    }else{
        $('.modal').show();
        if(user){
            console.log(user);
            $('#username').val(user.username);
            $('#password').val(user.password);
            $('#savePwd')[0].checked=true;
        }
    }
    //登录验证
    $('#login input[type="submit"]').click(function(e){
        e.preventDefault();
        var obj={
            username:$('#username').val(),
            password:$('#password').val()
        }
        $.post('/login',obj,function(data){
            if(data.result){
                if($('#savePwd')[0].checked){
                    window.localStorage.setItem('parsec_user',JSON.stringify(obj));
                }else{
                    window.localStorage.removeItem('parsec_user');
                }
                window.sessionStorage.setItem('parsec_user',data.result.username);
                $('.modal').fadeOut('slow');
                $('nav .user').html(data.result.username);
                $('.module').load('data/main.html');
                setTimeout(function(){
                    $('header').slideUp(500);
                },1500);
            }else{
                if(data.message){
                    $('.msg_login').html(data.message);
                }else{
                    $('.msg_login').html('用户名或密码错误');
                }
            }
        });
    });
    //退出登录
     $('.setting .logOut').click(function (e) {
         e.preventDefault();
         $.get(' /logout',function(data){
             if(!data.code){
                 window.sessionStorage.removeItem('parsec_user');
                 window.location.reload(true);
             }
         });
     });
    //用户信息设置
    $('.setting .userSet').click(function (e) {
        e.preventDefault();
    });
    //标签导航
    $('.tabs li a').click(function (e) {
        e.preventDefault();
        $('.tabs a').removeClass();
        $(this).addClass('active-tabs');
        $('.module').empty().load($(this).attr('href'));
    });
});
