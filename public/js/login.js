/**
 * Created by husu on 16/8/31.
 */

$(document).ready(function(){
    $("#loginBut").click(function(e){
        var url = '/login';
        $.ajax({
            url:url,
            type:'post',
            dataType:'json',
            data:$("#loginForm").serialize(),
            success:function(data){
                if(data.code == 0 ){
                    document.location = data.result.gotoUrl;
                }
            }
        });
    });
});