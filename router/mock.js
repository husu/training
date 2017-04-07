/**
 * Created by husu on 2017/1/12.
 */

'use strict';
var router = require('express').Router();

var _= require('lodash');
let ns = require('../service/notificationService');


// let ns = new NotificationService();

/**
 * 获得一个评论，我也不知道也没有用，姑且写一写，么么哒
 */
router.get('/trip',function(req,res){
   var returnValue = {
       "code":0,
        "message":"ok",
        "result":{
            "hasNext":true,
            "list":[
                {"price":"15\u5143","taddress":"\u89c2\u97f3\u6865","time":"\u6628\u592913:30"},
                {"price":"15.5\u5143","taddress":"\u89e3\u653e\u7891","time":"2017\u5e741\u67088\u65e513:30"},
                {"price":"15.23\u5143","taddress":"\u9f99\u6e56\u65f6\u4ee3\u5929\u885712\u53f7","time":"2017\u5e741\u67087\u65e59:30"},
                {"price":"20.5\u5143","taddress":"\u4e5d\u9f99\u5761\u77f3\u6865\u94fa\u6cf0\u5174\u5e7f\u573a101\u53f7","time":"2017\u5e741\u67081\u65e512:30"
                }
                ]
       }
   };
   res.send(returnValue);
});

router.get('/platform',function (req,res) {
    let obj = {
        "result":[
            {"id":"84780D45C8684BC7BBCE56FA26B9BE72","name":"\u6ef4\u6ef4\u4f18\u6b65"},
            {"id":"E04B004CE4244C7A9871EDF98C64298D","name":"\u6613\u9053\u4e13\u8f66"},
            {"id":"E9B0F2E971A0446D9F956A5E040601E1","name":"\u795e\u5dde\u4e13\u8f66"}
        ],"message":"\u7f51\u7ea6\u8f66\u5e73\u53f0","code":0};
    res.send(obj);

});

module.exports = router;