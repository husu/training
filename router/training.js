/**
 * Created by husu on 16/8/20.
 */
'use strict';
var router = require('express').Router();
var ts = require('../service/trainingService');
var util =  require('../util');
var _= require('lodash');

/**
 * 获得一个培训的信息
 */
router.get('/detail/:id', function(req, res) {
    var id  = req.params.id;
    let result ={
    };

    ts.get(id).then(obj=>{

        var training =  util.avObjectToJson(obj);
        var creator = obj.get('creator');
        training.creator = {
            objectId:creator.id,
            username:creator.get('username')
        };


        result.code = 0;
        result.result=training;
        return res.send(result);
    }).fail(e=>{
        return res.send({
            code: e.errorCode,
            message: e.message
        })
    });
});

/**
 * 获得一个培训列表
 */
router.get('/list',function(req,res){
    var pageSize = req.query.pageSize || req.body.pageSize ||10;
    var page = req.query.page || req.body.page || 1;
    var params = {
        tags:req.params.tags,
        title:req.params.title,
        status:util.TRAININGSTATUS.TRAINING
    };

    return ts.list(params,page,pageSize).then(function(list){

       var trainList =  _.map(list,o=>{
            var user  = o.get('creator');

           o= _.pick(util.avObjectToJson(o),['commentNum','tags','content','createdAt','creator','imgURL','objectId','thumbUpNum','trainDate','title']);
             o.creator = {
                id:user.id,
                username:user.get('username'),
                nickName:user.get('nickName')
           };
           return o;
       });

        let resultObj = {
            code:0,
            result:trainList
        };
        return res.send(resultObj);
    }).fail(function(e){
        return res.send({
            code: e.errorCode,
            message:e.message
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

/**
 * 安排一个培训
 */
router.post("/plan",function(req,res){
    var trainObj = req.body;

    let result ={
    };

    if(!trainObj.trainDate){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.message =   '培训时间不可为空';
        result.errors =  [util.ERROR.PARAMETER_MISSING];
        return res.send(result);
    }

    if(!trainObj.objectId){
        result.code = util.ERROR.PARAMETER_MISSING.errorCode;
        result.errors = [util.ERROR.PARAMETER_MISSING];
        result.message = '培训信息丢失';
        return res.send(result);
    }


    trainObj.trainDate = new Date(trainObj.trainDate);

    if(trainObj.trainDate.getTime()<=(new Date()).getTime()){
        result.code = util.ERROR.PARAMETER_IS_NOT_CORRECT.errorCode;
        result.message = "培训时间不得小于当前时间";
        result.errors = [util.ERROR.PARAMETER_IS_NOT_CORRECT];
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
    }).catch(e=>{
        result ={
            code:util.ERROR.INTERNAL_ERROR.errorCode,
            message:'保存失败',
            errors:[e]
        };
        console.log(e);
        return res.send(result);
    });



});



/**
 * 查询看当天是否有培训安排
 */
router.get("/trainByTime",function(req,res) {
    var trainDate = req.query.trainDate || req.body.trainDate;

    let result ={
        code:0
    };


    var paraDate;
    if(trainDate){
        paraDate = new Date(trainDate);
    }


    ts.queryTrainingByTime(paraDate).then(function(obj){

        if(obj){
            result.message = '当天已经有培训安排';
            result.result = 1;
        }else{
            result.message ='';
            result.result = 0;
        }

        return res.send(result);

    }).fail(e=>{
        result.code = e.errorCode;
        result.message = e.message;
        result.errors=[e];
        return res.send(result);
    })

});





module.exports = router;