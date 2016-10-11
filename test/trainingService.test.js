/**
 * Created by husu on 16/8/23.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var ts= require('../service/trainingService');
var assert = require('assert');



const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");

chai.use(chaiHttp);



describe.skip('测试关于培训的服务正常执行的情况',function(){
    before(function() {
        AV.init({
            appId: "z8hHpv1FjlFE051ASMqVR0v4-gzGzoHsz",
            appKey: "rQPErxRf2r2AUG3I5TLphl6o",
            masterKey: "iMShNS8MqjlEGw5nzRL8ziac"
        });
        AV.Cloud.useMasterKey();

        return ts.list({tags:['test111']}).then(function(list){
             list.forEach(function(item){
                ts.delete(item.id);
            });

        });
    });
    it('测试新增和修改一个Training',()=>{
        var t = {title:'测试121212',status:1,content:'测试新增需求',tag:['test111']};
        return ts.save(t).then(function(r1){
            assert.equal(r1.get("title"),'测试121212','测试新增后的标题');
            return r1;
        }).then(function(r2){
            t.id = r2.id;
            t.title = "测试232343";
            return ts.save(t);
        }).then(function(r3){
            assert.equal(r3.get("title"),'测试232343','测试修改后的标题');
            return r3;
        }).then(r4 =>{     //测试获得一个培训对象
            return ts.get(r4.id).then(r5=>{
                assert.equal(r4.id,r5.id);
                assert.equal(r4.get('title'),r5.get('title'));
                assert.equal(r5.get('title'),'测试232343');
                return r5;
            });
        }).then(r5 =>{ //测试通过tag查询列表
           return ts.list({tags:['test111']}).then(function(list){
                assert.ok(list.length>0,'测试查询列表返回数量大于0');
                return r5;
           });
        }).then(r5=>{ // 测试通过status获得列表
              return ts.list({status:0}).then(function(list){
                  assert.ok(list.length<1,'测试列表为空');
                  return r5;
              })
        }).then(r5=>{
            return ts.get(r5.id).then(r6=>{
                assert.equal(r5.id,r6.id);
                assert.equal(r5.get('title'), r6.get('title'));

                return r6;
            });
        }).
        then(r5=>{
            return ts.delete(r5.id).then(function(){
               return ts.list({tags:['test111']}).then(function(list){
                   assert.ok(list.length<1,'测试执行删除后列表为空');
                });
            });
        })
    });
    it('测试关于培训的服务异常情况',()=>{
        var delResult =  ts.delete();
        assert.equal(delResult._error.errorCode,-1);
        assert.equal(delResult._error.message,'objectId为空');

        var listResult =ts.list("测试");
        assert.equal(listResult._error.errorCode,-2);

        var getResult = ts.get();
        assert.equal(getResult._error.errorCode,-1);
    });
});


describe.skip('测试关于培训的RESTful API',function() {
    const request = chai.request.agent('http://localhost:3261');


    it('测试RESTful API',function(done){
        let t = {title:'测试Restful API新增',
            status:1,
            content:'测试新增需求',
            trainDate:new Date(),
            tag:['test111']
        };


        request.post(`/login`).send({"username":"test","password":"123456"}).then(()=> {
            request.post(`/v1/training`).send(t).then(res=>{
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("object", "返回对象");
                expect(res.body).haveOwnProperty("code");
                expect(res.body).haveOwnProperty("message");
                expect(res.body).haveOwnProperty("result");

                assert.equal(res.body.result.title,'测试Restful API新增','测试保存的title是否正确');
                return res;

            }).then(function(res0){
                var para = {
                    page:1,
                    pageSize:10,
                    tags:'test111'
                };
                return request.get('/v1/training/list').send(para).then(res=>{
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an("object", "返回对象");
                    expect(res.body).haveOwnProperty("code");
                    expect(res.body).haveOwnProperty("result");
                    assert.ok(res.body.result.length>0,'测试列表查询是否正确');

                    return res0;
                })
            }).then(function(res1){
                let tid= res1.body.result.objectId;
                request.delete(`/v1/training/${tid}`).then(res1=>{
                    expect(res1.body).haveOwnProperty("code");
                    expect(res1.body).haveOwnProperty("message");
                    expect(res1.body.code).to.be.equal(0,'测试是否返回删除成功的状态值');
                    done();
                }).catch(e1=>{
                    done(e1);
                });

            }).catch(e=> {
                done(e);
            });
        });


    });
});



