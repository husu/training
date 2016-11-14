/**
 * Created by Taohailin on 2016/10/19.
 */
var username=window.sessionStorage.getItem('parsec_user');//用户名
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
//分页查询//that-按钮,elem-列表父元素,fun-dom更新函数,tags:1-willing,2-require,num:列表条数
function selectPage(url,pages,fun,jq,tags,that,num){
    if(!that){
        pages.page=1;
        $.get(url,pages,function (data) {
            if(data.result){
                if(pages.page>1||data.result.length>=pages.pageSize){
                    jq.siblings('.pages').show();
                }
                if(tags){jq.parent().show();}
                fun(data.result,jq,tags);
            }

        });
        return;
    }
    var totalPage="";
    num&&(totalPage=Math.ceil(num/pages.pageSize));
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
        }else{pages.page-=1;}//下一页数据为空
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
        $('nav a:last').html(username);
        $('.module').load('data/main.html');
        setTimeout(function(){
            $('header').slideUp(500);
        },1500);
    }else{$('.modal').show();}
    //登录验证
    $('#login input[type="submit"]').click(function(e){
        e.preventDefault();
        var obj=$('#login').serialize();
        $.post('/login',obj,function(data){
            if(data.result){
                window.sessionStorage.setItem('parsec_user',data.result.username);
                $('.modal').fadeOut('slow');
                $('nav a:last').html(data.result.username);
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
    //标签导航
    $('.tabs li a').click(function (e) {
        e.preventDefault();
        $('.tabs a').removeClass();
        $(this).addClass('active-tabs');
        $('.module').load($(this).attr('href'));
    });

});
