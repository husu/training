/**
 * Created by taohailin on 2016/11/11.
 */
var pagesTrain={page:1,pageSize:6};//获取列表
$(function(){
    // 加载列表
    $.get('v1/training/list',pagesTrain,function(data){
        if(data.result.length||data.result) {
                updateList(data.result, $('#courses .train_list'));
            if (data.result.length >= 6) {
                    $('#courses>p').show();
                }
        }
    });
    //分页查询
    $('.pages a').click(function (e) {
        e.preventDefault();
        selectPage('v1/training/list',pagesTrain,$(this),$('#courses .train_list'));
    });
    //培训详情的跳转
    $('.train_list').on('click','a',function(e){
        e.preventDefault();
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        window.sessionStorage.removeItem('assign');
        $('.content').empty().load($(this).attr('href'));
    });
});