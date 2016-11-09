/**
 * Created by Taohailin on 2016/10/19.
 */
var pagesTrain={page:1,pageSize:6};//获取列表
$(function(){
    if(username){
        $('nav a:last').html(username);
        $.get('v1/training/list',pagesTrain,function(data){
            if(data.result) {
                updateList(data.result, $('#courses .train_list'));
                if (data.result.length >= 6) {
                    $('#courses>p').show();
                }
            }
        });
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
                $.get('v1/training/list',pagesTrain,function(data){
                    if(data.resutl){
                        updateList(data.result,$('#courses .train_list'));
                        if(data.result.length>=6){$('#courses>p').show();}
                    }
                });
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
    $('.tabs li:not(:nth-child(2)) a').click(function (e) {
        e.preventDefault();
        $('.tabs a').removeClass();
        $(this).addClass('active-tabs');
        $($(this).attr('href')).show().siblings().hide();
    });
    //分页查询
    $('.pages a').click(function (e) {
        e.preventDefault();
        selectPage('v1/training/list',pagesTrain,$(this),$('#courses .train_list'));
    });
    //培训详情的跳转
    $('.train_list').on('click','a',function(){
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
    });
});
