/**
 * Created by taohailin on 2016/10/31.
 */
var pagesWilling={page:1,pageSize:6}
var pagesRequire={page:1,pageSize:6}
$(function () {
    $.get('v1/willingness/list',pagesWilling,function(data){
        updateList(data.result,$('.willing>div'));
        if(data.length<6){$('.willing>p:last').hide();}
    });
    $.get('v1/requirements/list',pagesRequire,function(data){
        updateList(data.result,$('.require>div'));
        if(data.length<6){$('.require>p:last').hide();}
    });
    //创建培训需求
    $('.main>p>a').click(function(e){
            e.stopPropagation();
            e.preventDefault();
            $('.add_train').fadeIn('slow');
            $('.default_img').hide();
        }
    );
    //选择图片
    $('.add_train button:first').click(function (e) {
        e.preventDefault();
        $('.default_img').show(1000);
    });
    $('.default_img img').click(function () {
        $(this).parent().hide(1000);
        $(this).css('border','2px solid green').siblings().css('border','2px solid #ddd');
        $('#add input[type="hidden"]').val($(this).attr('src'));
    });
    //提交新增培训
    $('.add_train button:last').click(function (e) {
        e.preventDefault();
        var res=$('#add').serialize();
        $.post('v1/willingness',res, function (data) {
            if(!data.code){ $('.add_train').fadeOut();}else{$('.add_train>p').html(data.errors).show();}
        });
    });
    $('.add_train').click(function (e) {e.stopPropagation();});
    $(document).click(function(e){
        $('.add_train').fadeOut();
    });
    //分页查询更多列表
    $('.pages a').click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        if($(this).parent().parent().attr('class')=='willing'){
            selectPage('v1/willingness/list',pagesWilling,$(this),$('.willing>div'));
        }else{
            selectPage('v1/requirements/list',pagesRequire,$(this),$('.require>div'));
        }
    });
    //意愿需求详情
    $('.willing>div,.require>div').on('click','a',function(){
        $(this).attr('data-id')&&window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
    });
});