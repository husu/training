/**
 * Created by husu on 16/10/25.
 */

'use strict';
var router = require('express').Router();
var util =  require('../util');
var fs = require('fs');
var AV = require('leanengine');

router.post('',function(req,res){
        var iconFile = req.files.image;
        if(iconFile){
            fs.readFile(iconFile.path, function(err, data){
                if(err)
                    return res.send("读取文件失败");
                var base64Data = data.toString('base64');
                var theFile = new AV.File(iconFile.name, {base64: base64Data});
                theFile.save().then(function(theFile){
                    res.send("上传成功！");
                });
            });
        } else {
            res.send("请选择一个文件。");
        }
});

module.exports = router;