/**
 * Created by husu on 16/11/11.
 */


'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var assert = require('assert');


var  util = require('../util');
const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");

chai.use(chaiHttp);


describe('测试培训意愿的 RESTful API',function() {
    const request = chai.request.agent('http://localhost:3261');
    before(function(){
        return request.post(`/login`).send({"username":"test","password":"123456"}).then(()=> {
            console.log('登录成功');
        });
    });

    it('测试新增培训意愿',done=>{
        let user =  request.currentUser;
        let t = {
            title: '测试Restful API意愿2222',
            status: util.TRAININGSTATUS.WILLINGNESS,
            content: '测试新增意愿',
            trainDate: new Date(),
            tag: ['test222'],
            author:user
        };
        request.post(`/v1/willingness`).send(t).then(res=>{
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object", "返回对象");
            expect(res.body).haveOwnProperty("code");
            expect(res.body).haveOwnProperty("message");
            expect(res.body).haveOwnProperty("result");
            expect(res.body.result.type).to.equal(util.COMMENTTYPE.WILLINGNESS);

            assert.ok(res.body.result.objectId,"测试新增后是否有ObjectId");
            return res;
        }).then(res=>{
            let t1 = {
                page:1,
                pageSize:6
            };
            request.get(`/v1/willingness/list`).send(t1).then(res1=>{
                expect(res1.body).haveOwnProperty("code");
                expect(res1.body.code).to.be.equal(0,'测试是否返回成功的状态值');
                expect(res1.body.result.length).to.be.above(0,'测试列表是否大于0');
                done();
            }).catch(e=>{
                done(e);
            })
        }).catch(e1=>{
            done(e1);
        });
    });


});