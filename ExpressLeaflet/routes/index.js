var express = require('express');
var router = express.Router();
var pgclient =require('dao/pgHelper');
pgclient.getConnection();
var cors = require('cors');
	router.use(cors());

/* GET home page. */
router.get('/', function(req, res) {
    if(req.cookies.islogin){
        req.session.islogin=req.cookies.islogin;
    }
	if(req.session.islogin){
	    res.locals.islogin=req.session.islogin;
	}
  	res.render('index', { title: 'HOME',test:res.locals.islogin});
});

router.route('/login')
    .get(function(req, res) {
        if(req.session.islogin){
            res.locals.islogin=req.session.islogin;
        }

        if(req.cookies.islogin){
            req.session.islogin=req.cookies.islogin;
        }
        res.render('login', { title: '用户登录' ,test:res.locals.islogin});
    })
    .post(function(req, res) {
        
        result=null;
        //调用数据库管理类中的查询语句，参数是表名、用户名
		  pgclient.select('userinfo',{'username': req.body.username},'', function (result) {
            if(result[0]===undefined){
                res.send('没有该用户');
            }else{
                if(result[0].password===req.body.password){
                    req.session.islogin=req.body.username;
                    res.locals.islogin=req.session.islogin;
                    res.cookie('islogin',res.locals.islogin,{maxAge:60000});
                    res.redirect('/');
                }else
                {
                    res.redirect('/login');
                }
               }
        });
    });

router.get('/logout', function(req, res) {
    res.clearCookie('islogin');
    req.session.destroy();
    res.redirect('/');
});
router.get('/home', function(req, res) {
    if(req.session.islogin){
        res.locals.islogin=req.session.islogin;
    }
    if(req.cookies.islogin){
        req.session.islogin=req.cookies.islogin;
    }
    res.render('index', { title: 'Home', test: res.locals.islogin });
});

router.route('/reg')
    .get(function(req,res){
        res.render('reg',{title:'注册'});
    })
    .post(function(req,res) {
        //调用数据库管理类中的写入语句，参数是表名userinfo，username、password、email、telephone
		pgclient.save('userinfo',{'username': req.body.username,'password': req.body.password2,'email': req.body.email,'telephone': req.body.telephone}, function (err) {
            pgclient.select('userinfo',{'username': req.body.username},'', function (result) {
				if(result[0]===undefined){
					res.send('注册没有成功，请重新注册');
				}else{
//					res.send('注册成功！');
					res.redirect('/login');
				}
			}); 
        });
    });

//添加关联字段查询工厂人口
router.get('/popquery', function(req, res) {
        var pid = req.query.pid;
        pgclient.selectFacPop_BypolygonId('raw_mobile', pid, '', function(result) {
            if(result[0] === undefined) {
                res.send('返回空值');
            } else {
                res.send(result);
                console.log("返回结果：" + JSON.stringify(result))
            }
        });

});

/**
 * 查询列表页
 */
router.get('/echartsdb', function (req, res, next) {
    //页面跳转时，如果要保留登录信息，需要增加session的传递
    if(req.cookies.islogin){
        req.session.islogin=req.cookies.islogin;
    }
    if(req.session.islogin){
        res.locals.islogin=req.session.islogin;
    }
    //查数据库userinfo表并获取表中所有数据
    pgclient.select('polygon_gdp','','',function (result) {
        //console.log(result);
        if(result[0]===undefined){
            res.send('没有用户信息！');
        }else{
           	//页面跳转时，如果要保留登录信息，需要增加session的传递
            res.render('echartsdb', {title: '图表数据测试', datas: result,test:res.locals.islogin});
        }
    })
});

module.exports = router;