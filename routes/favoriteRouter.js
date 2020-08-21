const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());
//-------------------------------------------------Favorites
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res)=>{
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next)=>{
    Favorites.find({'user': req.user._id})
    .populate('user')
    .populate('dishes')
    .then((fav)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({'user': req.user._id})
    .then((fav)=>{
        if(fav!=null){
            for(var i=0;i<req.body.length;i++){
                if(fav.dishes.indexOf(req.body[i]._id)===-1)
                fav.dishes.push(req.body[i]._id);
            }
            fav.save()
            .then((favs)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            },(err)=>next(err));
        }
        else{
            Favorites.create({'user': req.user._id})
            .then((fav)=>{
                for(var i=0;i<req.body.length;i++){
                    if(fav.dishes.indexOf(req.body[i]._id)===-1)
                        fav.dishes.push(req.body[i]._id);
                }
                fav.save()
                .then((favs)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(favs);
                },(err)=>next(err));
            },(err)=>next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.remove({'user': req.user._id})
    .then((fav)=>{        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);        
    },(err)=>next(err))
    .catch((err)=>next(err));
});
//-------------------------------------------------Favorite/DishId
favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res)=>{
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({user: req.user._id})
    .then((fav)=>{
        if(!fav){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exits": false, "favorites": fav});
        }
        else{
            if(fav.dishes.indexOf(req.params.dishId)<0){
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exits": false, "favorites": fav});
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exits": true, "favorites": fav});
            }
        }
    },(err)=>next(err))
    .catch((err)=>next(err));    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({'user': req.user._id})
    .then((fav)=>{
        if(fav!==null){
            if(fav.dishes.indexOf(req.params.dishId)===-1){
                fav.dishes.push(req.params.dishId);
                fav.save()
                .then((favs)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs);
                },(err)=>next(err));
            }
            else{
                err = new Error('Favorite dish '+req.params.dishId+' already exists!');
                err.status = 403;
                return next(err);
            }
        }
        else{
            Favorites.create({'user': req.user._id})
            .then((fav)=>{                
                fav.dishes.push(req.params.dishId);
                fav.save()
                .then((favs)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs);
                },(err)=>next(err));
            },(err)=>next(err));
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=>{
    Favorites.findOne({'user': req.user._id})
    .then((fav)=>{
        if(fav===null){
            err = new Error('Favorite dishes not found !');
            err.status = 404;
            return next(err);
        }
        else{
            if(fav.dishes.indexOf(req.params.dishId)===-1){
                err=new Error('Favorite dish '+req.params.dishId+' not found!');
                err.status = 404;
                return next(err);
            }
            else{
                fav.dishes.splice(fav.dishes.indexOf(req.params.dishId), 1);
                fav.save()
                .then((favs)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs);
                },(err)=>next(err));
            }
        }        
    },(err)=>next(err))
    .catch((err)=>next(err));
});
//-------------------------------------------------
module.exports = favoriteRouter;