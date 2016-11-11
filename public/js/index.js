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
//分页查询
function selectPage(url,pages,that,elem){//that-按钮,elem-列表父元素,tags:1-willing,2-require,
    if(that.html()=="下一页"){
        pages.page+=1;
        $.get(url,pages, function (data) {
            if(data.result.length){
                that.prev().show();
                updateList(data.result,elem);
                data.result.length<6&&that.hide();
            }else{pages.page-=1;that.hide();}
        });
    }else {
        pages.page -= 1;
        $.get(url,pages, function (data) {
            if(data.result.length){
                updateList(data.result,elem);
                that.next().show();
            }
        });
        if (pages.page==1) {that.hide();}
    }
}
//更新查询列表
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
                <dt><a href="data/detail_train.html" data-id="${list[i].objectId}"><img src="${list[i].imgURL||'../imgs/default_course.png'}"/><\/a><\/dt>
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
