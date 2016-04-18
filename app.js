var express = require('express');
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie');

var path = require('path');
var bodyParser = require('body-parser');

var port = process.env.PORT || 4000;
var app = express();

mongoose.connect('mongodb://localhost/nodeMongodb1');

app.set('views', './views/pages');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.locals.moment = require('moment');

app.listen(port);

console.log('server open on port ' + port);

//index page
app.get('/', function(req, res){
  Movie.fetch(function (err, movies) {
    if(err){
      console.log(err);
    }
    res.render('index', {
      title: '首页',
      movies: movies
    });
  });
});

//detail page
app.get('/movie/:id', function(req, res){
  var id = req.params.id;
  Movie.findById(id, function (err,movie) {
    if(err){
      console.log(err);
    }
    res.render('detail', {
      title: movie.title,
      movie: movie
    })
  })
});

//admin page
app.get('/admin/movie', function(req, res){
  res.render('admin', {
    title: '录入',
    movie: {
      title: '',
      doctor: '',
      country: '',
      year: '',
      poster: '',
      flash: '',
      summary: '',
      language: '',
    }
  })
});

//admin update movie
app.get('/admin/update/:id', function (req, res) {
  var id = req.params.id;
  if(id){
    Movie.findById(id, function (err, movie) {
      if(err){
        console.log(err);
      }
      res.render('admin', {
        title: '后台更新页',
        movie: movie
      })
    });
  }
});

//admin post movie
app.post('/admin/movie/new', function (req, res) {
  var id = req.body.movie._id;
  var movieObj = req.body.movie;
  var _moive;
  if(id !== 'undefined'){
    Movie.findById(id, function (err,movie) {
      if(err){
        console.log(err);
      }
      _moive = _.extend(movie, movieObj);
      _moive.save(function (err, movie) {
        if(err){
          console.log(err);
        }
        res.redirect('/movie/' + movie._id);
      });
    });
  }else{
    _moive = new Movie({
      doctor: movieObj.doctor,
      title: movieObj.title,
      country: movieObj.country,
      language: movieObj.language,
      year: movieObj.year,
      poster: movieObj.poster,
      summary: movieObj.summary,
      flash: movieObj.flash
    });
    
    _moive.save(function (err, movie) {
      if(err){
        console.log(err);
      }
      res.redirect('/movie/' + movie._id);
    });
  }
})

//list page
app.get('/admin/list', function(req, res){
  Movie.fetch(function (err, movies) {
    if(err){
      console.log(err);
    }
    res.render('list', {
      title: '列表',
      movies: movies
    });
  });
});

//list delete movie
app.delete('/admin/list', function (req, res) {
  var id = req.query.id;
  if(id){
    Movie.remove({_id: id}, function (err, movie) {
      if(err){
        console.log(err);
      }else{
        res.json({success: 1});
      }
    });
  }
});