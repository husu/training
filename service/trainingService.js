/**
 * Created by husu on 16/8/20.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Training = AV.Object.extend('Training');
var myUtil =  require('../util.js');


//noinspection JSUnresolvedVariable
module.exports ={
    /**
     * 保存一个培训
     * @param obj
     * @returns {*}
     */
    save:function(obj){
        var training = new Training();
        if(training.id){
           training =  AV.Object.createWithoutData('Training',training.id);
        }
        myUtil.copyProperty(training,obj);



        return training.save();

    },
    /**
     * 删除一个培训
     * @param objectId
     * @returns {*}
     */
    delete:function(objectId){
        if(!objectId){
            return AV.Promise.error(myUtil.ERROR.OBJECT_ID_IS_EMPTY);
        }
       return AV.Object.createWithoutData('Training',objectId).destroy();
    },
    /**
     * 获得培训的分页列表
     * @param params
     * @param pageNo
     * @param pageSize
     * @returns {*}
     */
    list:function(params,pageNo,pageSize){
        if(!pageSize){
            pageSize = 10;
        }

        if(!pageNo){
            pageNo=1;
        }

        params =  params || {};

        if(typeof params != "object"){
            return  AV.Promise.error(myUtil.ERROR.IS_NOT_A_OBJECT);
        }


        var query  =  new AV.Query("Training");
        query.limit(pageSize);
        query.addDescending('thumbUpNum');
        query.addDescending('createdAt');
        query.skip(pageSize*(pageNo-1));
        if(params.tags){
            query.containsAll("tag",params.tags);
        }
        if(params.title){
            query.contains('title',params.title);
        }
        if(params.status !=null){
            query.equalTo('status',params.status);
        }

        return query.find().fail(function(e){
            let errInf = myUtil.ERROR.LIST_FIND_FAIL;
            errInf.description = e.message;
            return AV.Promise.error(errInf);
        });
    } ,
    /**
     * 获得一个培训对象
     * @param id
     * @returns {*}
     */
    get:function(id){
        if(!id){
            return AV.Promise.error(myUtil.ERROR.OBJECT_ID_IS_EMPTY);
        }
        return AV.Object.createWithoutData('Training',id).fetch();
    }
};

