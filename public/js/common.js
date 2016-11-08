/**
 * Created by taohailin on 2016/10/28.
 */
var username=window.sessionStorage.getItem('parsec_user');//用户名
var trainId=window.sessionStorage.getItem('train_id');//培训id
username&&$('nav a:last').html(username);
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
function selectPage(url,pages,that,elem){
    if(that.html()=="下一页"){
        pages.page+=1;
        $.get(url,pages, function (data) {
            if(data.result.length!=0){
                that.prev().show();
                updateList(data.result,elem);
                data.result.length<6&&that.hide();
            }else{pages.page-=1;that.hide();}
        });
    }else {
        pages.page -= 1;
        $.get(url,pages, function (data) {
            updateList(data.result,elem);
            that.next().show();
        });
        if (pages.page==1) {that.hide();}
    }
}
//更新查询列表
function updateList(list,jq){
    var frag=document.createDocumentFragment();
    for(var i in list){
        var time=preTime(list[i].trainDate,true);
        $(frag).append(`
            <dl>
                <dt><a href="detail_train.html" data-id="${list[i].objectId}"><img src="${list[i].imgURL||'../imgs/default_course.png'}"/><\/a><\/dt>
                <dd>${list[i].title}</dd>
                ${time?('<dd>时间：'+time+'</dd>'):""}
                ${list[i].creator.username?('<dd>主讲：'+list[i].creator.username+'</dd>'):""}
            </dl>
        `);
    }
    jq.html(frag);
}
