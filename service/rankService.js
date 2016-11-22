/**
 * Created by husu on 16/11/15.
 */
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;

// `AV.Object.extend` 方法一定要放在全局变量，否则会造成堆栈溢出。
// 详见： https://leancloud.cn/docs/js_guide.html#对象
var Training = AV.Object.extend('Training');
var myUtil =  require('../util.js');


module.exports ={
    /**
     * 获得排行榜
     */
    getTopTraining:function(top,rankType){
        let query = new AV.Query("Training");
        if(rankType == myUtil.COMMENTTYPE.COMMENT){
            query.addDescending("commentNum");
        }else{
            query.addDescending("thumbUpNum");
        }
        query.include('creator');

        query.equalTo("status",myUtil.TRAININGSTATUS.TRAINING);
        if(!top)top=10;

        query.limit(top);

        return query.find();
    }
};
