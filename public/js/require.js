/**
 * Created by taohailin on 2016/10/31.
 */
var pagesWilling={page:1,pageSize:6};
var pagesRequire={page:1,pageSize:6};
var createUrl=null;//创建培训意愿或需求的请求url
$(function () {
    $.get('../v1/willingness/list',pagesWilling,function(data){
        if(data.result.length){
            updateList(data.result,$('.willing>div'),1);
            if(data.result.length>=6){$('.willing>p:last').show();}
            $('.willing').show();
        }
    });
    $.get('../v1/requirements/list',pagesRequire,function(data){
        if(data.result.length){
            updateList(data.result,$('.require>div'),2);
            if(data.result.length>=6){
                $('.require>p:last').show();
            }
            $('.require').show();
        }
    });
    //创建培训需求
    $('.main>p>a').click(function(e){
            e.preventDefault();
            createUrl=$(this).html()=='我&nbsp;要&nbsp;讲'?'v1/willingness':'v1/requirements';
            $('.add_train').fadeIn('slow');
            $('.default_img').hide();
            $('.modal-content>p').hide();
            $('#select').val('选择图片');
            $('#add')[0].reset();
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
        $.post(createUrl,res, function (data) {
            if(!data.code){ $('.add_train').fadeOut();}else{$('.modal-content>p').html(data.errors).show();}
        });
    });
    $('.modal-content').click(function (e) {e.stopPropagation();});
    $('.add_train').click(function () {$('.add_train').fadeOut();});
    //分页查询更多列表
    $('.pages a').click(function (e) {
        e.stopPropagation();
        e.preventDefault();
        if($(this).parent().parent().hasClass('willing')){
            selectPage('../v1/willingness/list',pagesWilling,$(this),$('.willing>div'),1);
        }else{
            selectPage('../v1/requirements/list',pagesRequire,$(this),$('.require>div'),2);
        }
    });
    //意愿需求详情
    $('.willing>div,.require>div').on('click','a',function(e){
        e.preventDefault();
        $(this).attr('data-id')&&window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        if($(this).parents('.willing')[0]){
            window.sessionStorage.setItem('assign','1');
        }else{
            window.sessionStorage.setItem('assign','2');
        }
        $('.content').load($(this).attr('href'));
    });
});