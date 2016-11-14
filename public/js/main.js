/**
 * Created by taohailin on 2016/11/11.
 */
var pagesTrain={page:1,pageSize:6};//获取列表
$(function(){
    // 加载列表
    selectPage('v1/training/list',pagesTrain,updateList,$('#courses .train_list'));
    //分页查询
    $('.pages a').click(function (e) {
        e.preventDefault();
        selectPage('v1/training/list',pagesTrain,updateList,$('#courses .train_list'),'',$(this));
    });
    //培训详情的跳转
    $('.train_list').on('click','a',function(e){
        e.preventDefault();
        window.sessionStorage.setItem('train_id',$(this).attr('data-id'));
        window.sessionStorage.removeItem('assign');
        $('.content').load($(this).attr('href'));
    });
});