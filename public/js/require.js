/**
 * Created by taohailin on 2016/10/31.
 */
var pagesWilling={page:1,pageSize:6};
var pagesRequire={page:1,pageSize:6};
$(function () {
    $.get('v1/willingness/list',pagesWilling,function(data){
        if(data.result){
            updateList(data.result,$('.willing>div'));
            if(data.result.length>=6){$('.willing>p:last').show();}
            $('.willing').show();
        }
    });
    $.get('v1/requirements/list',pagesRequire,function(data){
        if(data.result){
            updateList(data.result,$('.require>div'));
            if(data.result.length>=6){$('.require>p:last').show();}
            $('.require').show();
        }
    });
    //创建培训需求
    $('.main>p>a').click(function(e){
            e.preventDefault();
            $('.add_train').fadeIn('slow');
            $('.default_img').hide();
            $('.modal-content>p').hide();
            $('#select').val('选择图片');
        }
    );
    //选择图片
    $('#select').click(function (e) {
        e.preventDefault();
        $('.default_img').slideToggle(500);
        $('#select').val('选择图片');
        $('#add input[type="hidden"]').val()&&($(this).siblings('img').attr('src',$('#add input[type="hidden"]').val()));
    });
    $('.default_img img').click(function () {
        $(this).css('border','3px solid green').siblings().css('border','3px solid #ddd');
        $('#add input[type="hidden"]').val($(this).attr('src'));
        $('#select').val('确认图片');
    });
    //提交新增培训
    $('.add_train input:last').click(function (e) {
        e.preventDefault();
        var res=$('#add').serialize();
        $.post('v1/willingness',res, function (data) {
            if(!data.code){ $('.add_train').fadeOut();}else{$('.modal-content>p').html(data.errors).show();}
        });
    });
    $('.modal-content').click(function (e) {e.stopPropagation();});
    $('.add_train').click(function () {$('.add_train').fadeOut();});
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