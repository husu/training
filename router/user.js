/**
 * Created by husu on 16/8/30.
 */
'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var util = require('../util');


router.post("/login",function(req,res){

    if(!req.body.username){
        return res.send({code:0,message:'用户名不可为空',errors:'用户名不可为空'})
    }

    if(!req.body.password){
        return res.send({code:0,message:'密码不可为空',errors:'密码不可为空'})
    }



    AV.User.logIn(req.body.username, req.body.password).then(function (user) {

        if(!user){
            return res.send({status:1,message:'登录异常，无法获取用户信息'})
        }

        res.saveCurrentUser(user);

        const keys = ['objectId','username','nickName','icon'];

        let userObj ={};
        keys.forEach(function(u){
            userObj[u] = user.get(u);
        });

        userObj.gotoUrl = '/index.html';


        var robj ={
            code:0,
            message:'登录成功',
            result:userObj
        };
        return res.send(robj);

    }).fail(function(e){
          return  res.send({status: false, error: e});

    });
});


// 登出账号
router.get('/logout', function(req, res) {
    if(req.currentUser){
        req.currentUser.logOut();
        res.clearCurrentUser();
    }
    res.send({code:0,message:'已经退出登录'});
});

// 修改密码
router.post('/changePwd',function(req,res){
    let userName = req.body.username;
    let oldPwd =  req.body.oldPwd;
    let newPwd = req.body.newPwd;

    if(!userName){
        return {
            code:util.ERROR.PARAMETER_MISSING,
            message:'用户名不可为空'
        }
    }

    if(!newPwd){
        return {
            code:util.ERROR.PARAMETER_MISSING,
            message:'新密码不可为空'
        }
    }


    AV.User.logIn(userName, oldPwd).then(function (loginedUser) {
        loginedUser.set('password',newPwd);
        loginedUser.save().then(user=>{
           return res.send({
               code:0,
               message:'修改成功'
           })
        });
    }).catch(function(error) {
        return res.send({
            code:util.ERROR.INTERNAL_ERROR.errorCode,
            message:error.message
        });
    });

});


module.exports = router;

