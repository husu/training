/**
 * Created by taohailin on 2016/11/29.
 */
var username=window.sessionStorage.getItem('parsec_userName');
var nickname=window.sessionStorage.getItem('parsec_nickName');
var userface=window.sessionStorage.getItem('parsec_userFace');
var user=JSON.parse(window.localStorage.getItem('parsec_user'));//记住用户密码
var replayNum=0;//消息数量=》用于保存消息数量
var replayNums=0;//消息数量=》用于判断否重新请求消息列表
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
//分页查询//fun-dom更新函数,jq-列表父元素;that-分页按钮,num:列表条数
function selectPage(url,pages,fun,jq,that,num){
    var totalPage=null;
    num&&(totalPage=Math.ceil(num/pages.pageSize));
    if(!that){//初始化查询
        if(!totalPage){
            pages.page=1;
            $('.pages a:contains("末页"),.pages a:contains("下一页")').removeClass('a-disable');
            $('.pages a:contains("首页"),.pages a:contains("上一页")').addClass('a-disable');
        }
        $.get(url,pages,function (data) {
            if(data.result){
                if(totalPage!=1&&(pages.page>1||data.result.length>=pages.pageSize)){
                    jq.siblings('.pages').show();
                }else{jq.siblings('.pages').hide();}
                if(totalPage!=pages.page){
                    $('.pages a:contains("末页"),.pages a:contains("下一页")').removeClass('a-disable');
                }
                fun(data.result,jq);
            }
        });
        return;
    }
    //分页查询
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
            fun(data.result,jq);
        }else{//下一页数据为空
            pages.page-=1;
            if(pages.page!=1){
                $('.pages a:contains("末页"),.pages a:contains("下一页")').addClass('a-disable');
                $('.pages a:contains("首页"),.pages a:contains("上一页")').removeClass('a-disable');
            }else{that.parent().hide();}
        }
    });
}
//回复消息列表
function updateNews(list) {
    var frag=document.createDocumentFragment();
    for(var i in list){
        $(frag).append(`
            <li data-id="${list[i].id}" data-from="${list[i].from}" data-type="${list[i].type}" class="${list[i].type==1?'':'systemMsg'}">${list[i].content}</li>
        `);
    }
    $('#msgList').html(frag);
}
$(function () {
    var flag=false;//判断消息列表是否显示;
    function getNewsNum(){//获得消息数量
        $.get('/v1/notification/count',function (data) {
            if (!data.code) {
                if (data.result != replayNum) {
                    replayNum = data.result;
                    replayNum && $('.receive').show() && $('nav .infoTip').addClass('noted');
                    $('.receive .replayNum').html(replayNum);
                    if($('#msgList').attr('display')!='none'){
                        $.get('/v1/notification',function(data){
                            !data.code&&updateNews(data.result);
                        });
                    }
                }
            }
        });
    }
    if(username){
        $('nav .user').html(nickname)&&$('nav .avatar img').attr('src',userface)&&getNewsNum();
        selectUrl='/v1/training/noScheduled/all';
        selectPage(selectUrl,pagesList,updateList,$('#require .list'));
        setTimeout(function(){
            $('header').slideUp(500);
        },1500);
    }else{
        $('.userLogin').show();
        $('#login button').find('i').hide();
        if(user){
            $('#username').val(user.username);
            $('#password').val(user.password);
            $('#savePwd')[0].checked=true;
        }
    }
    $('.modal-content').click(function (e) {e.stopPropagation();});
    // $('.modal').not('.userLogin').click(function(){$(this).fadeOut();});
    $('.close').click(function () {
        if($(this).parent().hasClass('detail-dialog')){
            $(this).parent().parent().fadeOut().prev().show();
        }else{$('.modal').fadeOut();}
    });
    //获得消息
    // 消息抖动
    $('nav .infoTip').on('animationend',function(){
        $(this).removeClass('noted');
    });
    // 消息数量
    setInterval(function () {
       getNewsNum();
    },15000);
    // 消息列表
    $('.receive .infoTip').click(function (e){
        e.preventDefault();
        if(replayNum){
            flag=flag?false:true;
            $('#msgList').stop().slideToggle(200);
            if((replayNum!=replayNums)&&flag){
                replayNums=replayNum;
                $.get('/v1/notification',function(data){
                    !data.code&&updateNews(data.result);
                });
            }
        }
    });
    //阅读消息
    $('#msgList').on('click','li',function(){
        var that=$(this);
        var train_id=that.attr('data-from');
        if(that.attr('data-type')==1){
            $.post('/v1/notification/',{id:$(this).attr('data-id')},function (data) {
                if(!data.code){
                    window.sessionStorage.setItem('train_id',train_id);
                    $('#detail').empty().load('detail.html');
                    $('.detail_box').show().prev().hide();
                    replayNum-=1;
                    !replayNum&&$('.receive').hide();
                    $('.receive .replayNum').html(replayNum);
                    that.remove();
                }
            });
        }else{return true;}
    });
    //登录验证
    $('#login input').focus(function(){
        $('nav .user').html(nickname)&&$('nav .avatar img').attr('src',userface);
        $('.msg_login').html('');
        $('#login button').find('span').html('登&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录').prev('i').hide();
    });
    $('#login button').click(function(e){
        $(this).find('span').html('登&nbsp;&nbsp;录&nbsp;&nbsp;中...').prev('i').show();
        e.preventDefault();
        var userObj={
            username:$('#username').val(),
            password:$('#password').val()
        }
        $.post('/login',userObj,function(data){
            if(data.result){
                if($('#savePwd')[0].checked){
                    window.localStorage.setItem('parsec_user',JSON.stringify(userObj));
                }else{
                    window.localStorage.removeItem('parsec_user');
                }
                getNewsNum();
                username=data.result.username;
                userface=data.result.icon||'imgs/user.png';
                nickname=data.result.nickName;
                window.sessionStorage.setItem('parsec_userName',username);
                window.sessionStorage.setItem('parsec_nickName',nickname);
                window.sessionStorage.setItem('parsec_userFace',userface);
                $('.modal').fadeOut('slow');
                $('nav .user').html(nickname);
                $('nav .avatar img').attr('src',userface);
                selectUrl='/v1/training/noScheduled/all';
                selectPage(selectUrl,pagesList,updateList,$('#require .list'));
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
    //上传头像
    $('nav .avatar').click(function(e){
        e.preventDefault();
        $('.uploadFace progress').val('');
        $('.uploadFace .clear').html('').removeClass('succ err');
        $('.uploadFace img').attr('src',userface);
        $('.modal').not('.userLogin').fadeIn('slow');
        $('.uploadFace').show().siblings('div').hide();
        $('#upFace').addClass('btn-disable').click(function(e){
            e.preventDefault();
            $('.uploadFace .clear').html('').removeClass('succ err');
            var formData = new FormData($('#uploadFace')[0]);
            $.ajax({
                url:'/v1/upload/icon',
                type: 'POST',
                xhr: function() {
                    myXhr = $.ajaxSettings.xhr();
                    if(myXhr.upload){
                        myXhr.upload.addEventListener('progress',progressHandlingFunction, false);
                    }
                    return myXhr;
                },
                beforeSend:function(){
                    $('.uploadFace progress').val('');
                },
                success:function(data){
                    if(data.result){
                        $('.uploadFace .clear').html('上传成功').addClass('succ');
                        $('nav .avatar img').attr('src',data.result.url);
                        window.sessionStorage.setItem('parsec_userFace',data.result.url);
                    }else{$('.uploadFace .clear').html('上传失败').addClass('err');}

                },
                error:function(){
                    $('.uploadFace .clear').html('上传失败').addClass('err');
                },
                data:formData,
                cache: false,
                contentType: false,
                processData: false
            });
            function progressHandlingFunction(e){
                if(e.lengthComputable){
                    $('.uploadFace progress').attr({value:e.loaded,max:e.total});
                }
            }
        });
        $('#uploadFace :file').change(function(){
            $('.uploadFace .clear').html('').removeClass('succ err');
            var file = this.files[0];
            if(!/\.(jpg|png|jpeg)$/.test(file.name)){
                $('.uploadFace .clear').html('图片类型只能为jpg、png、jpeg').addClass('err');
            }else{
                $('.uploadFace .clear').html(file.name).removeClass('err');
                $('#upFace').removeClass('btn-disable');
                var reader = new FileReader();
                reader.onload = function(event) {
                    $('.uploadFace img').attr('src',event.target.result);
                }
                reader.readAsDataURL(file);
            }
        });
    });
    //修改密码
    $('.setting .resPwd').click(function(e){
        e.preventDefault();
        $('.modal').not('.userLogin').fadeIn('slow');
        $('.resetPwd').show().siblings('div').hide();
        $('#setPwd')[0].reset();
        $('.msg_setPwd').html('');
        $('#setPwd input[type="submit"]').click(function (e) {
            e.preventDefault();
            console.log("1");
            var newPassword=$('#newPwd').val();
            var oldPassword=$('#oldPwd').val();
            if(newPassword&&oldPassword){
                if(newPassword==$('#resNewPwd').val()){
                    var obj={
                        username:username,
                        oldPwd:oldPassword,
                        newPwd:newPassword
                    }
                    $.post('/changePwd',obj,function(data){
                        "use strict";
                        if(!data.code){
                            $('.modal').hide();
                            if(window.localStorage.getItem('parsec_user')){
                                var obj={
                                    username:username,
                                    password:newPassword
                                }
                                window.localStorage.setItem('parsec_user',JSON.stringify(obj));
                            }
                        }else{$('.msg_setPwd').html(data.message)}
                    });

                }else{$('.msg_setPwd').html('两次新密码输入不一致')}
            }else{$('.msg_setPwd').html('原密码或新密码输入不能为空')}
        });
    });
    //退出登录
    $('.setting .logOut').click(function (e) {
        e.preventDefault();
        $.get('/logout',function(data){
            if(!data.code){
                window.sessionStorage.removeItem('parsec_userName');
                window.sessionStorage.removeItem('parsec_nickName');
                window.sessionStorage.removeItem('parsec_userFace');
                window.location.reload(true);
            }
        });
    });
    //用户信息设置
    $('.setting .userSet').click(function (e) {
        e.preventDefault();
        $('.modal').not('.userLogin').fadeIn('slow');
        $('.userData').show().siblings('div').hide()
    });
});
