/**
 * Created by husu on 16/8/23.
 */
'use strict';
var AV = require('leanengine');
AV.Promise._isPromisesAPlusCompliant = false;
var assert = require('assert');

const chai = require("chai");
var expect = chai.expect;
const chaiHttp = require("chai-http");
let util = require('../util');

chai.use(chaiHttp);

describe('测试评论、点赞的接口',function(){
    let request = chai.request.agent('http://localhost:3261');
    let  trainId;
    before(function(){
        return request.post(`/login`).send({"username":"test","password":"123456"}).then(()=> {
            console.log('登录成功');
        }).then(function(res1){
            let user =   request.currentUser;
            let t = {
                title: '测试Restful API新增11111',
                status: 1,
                content: '测试新增需求',
                trainDate: new Date(),
                tag: ['test111'],
                author:user
            };
            /**
             * 新建一个培训
             */
            return request.post(`/v1/training`).send(t).then(res=>{
                trainId = res.body.result.objectId;
                console.log(trainId);
            });
        });
    });

    it('测试评论RESTful API',function(done) {
        let comment = {
            content:'测试回复',
            author:request.currentUser
        };
        request.post(`/v1/comments/${trainId}`).send(comment).then((res)=>{
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object", "返回对象");
            expect(res.body).haveOwnProperty("code");
            expect(res.body).haveOwnProperty("message");
            expect(res.body).haveOwnProperty("result");
            expect(res.body.code).to.equal(0);
            //console.log(res.body);
            return res;
        }).then((res1)=>{
            request.get(`/v1/comments/list/${trainId}`).send({page:1,pageSize:10}).then(res =>{
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("object", "返回对象");
                expect(res.body).haveOwnProperty("code");
                expect(res.body).haveOwnProperty("result");
                assert.ok(res.body.result.length>0,'返回列表大小大于0');
                assert.ok(res.body.result[0].creator.username,'test','返回列表大小大于0');

                //assert.equal(res.body.result[0].creator,'test','验证发表者用户名');


                console.log(res.body);
                done();
            }).catch(function(e){
                done(e);
            });

        }).catch(function(e){
            done(e);
        });
    });


    /**
     * 测试点赞的Restful API
     */
    it('测试点赞的RESTful API',done =>{
        request.post(`/v1/thumbUp/${trainId}`).then(res=>{
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object", "返回对象");
            expect(res.body).haveOwnProperty("code");
            expect(res.body).haveOwnProperty("result");
            expect(res.body.message).to.equal('保存成功');
            return res;
        }).then(()=>{
            request.get(`/v1/thumbUp/${trainId}`).then(res=>{
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("object", "返回对象");
                expect(res.body).haveOwnProperty("code");
                expect(res.body).haveOwnProperty("result");
                expect(res.body.result).to.equal(0);
                done();
            }).catch(e=>{
                done(e);
            });
        }).catch(function(e){
            done(e);
        })

    });

    after(function(){
        /**
         * 删除一个培训
         */
        request.delete(`/v1/training/${trainId}`).then(res1=>{

        });
    });
});