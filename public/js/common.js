/**
 * Created by taohailin on 2016/11/29.
 */
var username=window.sessionStorage.getItem('parsec_username');//是否登录
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
//分页查询//fun-dom更新函数,jq-列表父元素;that-分页按钮,num:列表条数
function selectPage(url,pages,fun,jq,that,num){
    var totalPage=null;
    num&&(totalPage=Math.ceil(num/pages.pageSize));
    if(!that){
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
$(function () {
    username&& $('nav .user').html(window.sessionStorage.getItem('parsec_nickName'));
    $('.modal-content').click(function (e) {e.stopPropagation();});
    // $('.modal').not('.userLogin').click(function(){$(this).fadeOut();});
    $('.close').click(function () {
        if($(this).parent().hasClass('detail-dialog')){
            $(this).parent().parent().fadeOut().prev().show();
        }else{$('.modal').fadeOut();}
    });
    //上传头像
    $('nav .avatar').click(function(e){
        e.preventDefault();
        $('.uploadFace progress').val('');
        $('.uploadFace .clear').html('').removeClass('succ err');
        $('.uploadFace img').attr('src','');
        $('.modal').not('.userLogin').fadeIn('slow');
        $('.uploadFace').show().siblings('div').hide();
        $('#upFace').addClass('btn-disable').click(function(e){
            e.preventDefault();
            $('.uploadFace .clear').html('').removeClass('succ err');
            var formData = new FormData($('#uploadFace')[0]);
            console.log(formData);
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
                window.sessionStorage.removeItem('parsec_username');
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
})