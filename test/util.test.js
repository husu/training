/**
 * Created by husu on 16/8/23.
 */
'use strict';
var myUtil = require('../util');
var expect = require('chai').expect;

var AV = require('leanengine');

var mocha = require('mocha');



describe('测试工具类',()=>{
    var Training = AV.Object.extend('Training');

    it('测试从一般对象到AVObject复制属性',()=>{
        let obj = {title:'test',status:1,id:'yyysfsdfsf12123123123'};
        var myTraining = new Training();
        myUtil.copyProperty(myTraining,obj);
        expect(myTraining.get("title")).to.be.equal("test");
        expect(myTraining.get("status")).to.be.equal(1);
        expect(myTraining.get("objectId")).to.be.equal('yyysfsdfsf12123123123') ;
        expect(myTraining.id).to.be.equal('yyysfsdfsf12123123123') ;
  });
});

