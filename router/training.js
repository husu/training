/**
 * Created by husu on 16/8/20.
 */
'use strict';
var router = require('express').Router();
var ts = require('../service/trainingService');
var util =  require('../util');

/**
 * 获得一个培训的信息
 */
router.get('/detail/:id', function(req, res) {
   var id  = req.params.id;
    res.send({hello:id});
});

/**
 * 获得一个培训列表
 */
router.get('/list',function(req,res){
    var pageSize = req.query.pageSize || 10;
    var page = req.query.page || 1;
    var params = {
        tags:req.params.tags,
        title:req.params.title,
        status:util.TRAININGSTATUS.TRAINING
    };

    ts.list(params,page,pageSize).then(function(list){
        let resultObj = {
            code:0,
            result:list
        };
        return res.send(resultObj);
    }).fail(function(e){
        return res.send({
            code: e.errorCode,
            message: e.message
        });
    });

});

/**
 * 保存一个培训信息
 */
router.post('/',function(req,res){
    var trainObj = req.body;

    let result ={
    };

    if(!trainObj.trainDate){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message = util.ERROR.PARAMETER_MISSING.message;
        result.errors = '培训时间不可为空';
       return res.send(result);
    }

    if(!trainObj.title){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message = util.ERROR.PARAMETER_MISSING.message;
        result.errors = '培训标题不可为空';
        return res.send(result);
    }


    if(!trainObj.content){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message = util.ERROR.PARAMETER_MISSING.message;
        result.errors = '培训内容不可为空';
        return res.send(result);
    }

    trainObj.status=util.TRAININGSTATUS.TRAINING;




    trainObj.creator = req.currentUser;

    return ts.save(trainObj).then(function(obj){
        result ={
            code:0,
            message:'保存成功',
            result:obj
        };
        return res.send(result);
    });
});


/**
 * 删除自己的培训
 */
router.delete('/:id',function(req,res){
    let tid = req.params.id;
    var user =  req.currentUser;


    ts.get(tid).then(function(t){
        if(t.get('creator').id != user.id){
            return res.send({
                code:util.ERROR.AUTH_FAIL.errorCode,
                message:'没有删除的权限',
                errors:'只有创建者或管理员才能删除'
            })
        }

        return ts.delete(tid).then(function(){
            return res.send({
                code:0,
                message:'删除成功'
            });
        });
    }).fail(function(e){
        return res.send({
            code: e.errorCode,
            message: e.message
        })
    });


});





module.exports = router;