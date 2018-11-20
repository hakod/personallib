/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if(err){
          console.log(err)
        }
        let coll = db.collection('books')
        coll.find({},{comments: 0}).toArray((err,doc)=>{
          res.json(doc)
        })
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if (err){
          console.log(err)
        }
        if (!title) {
         res.send('invalid title')
         return
        }
        let o = ObjectId()
        let coll = db.collection('books')
        coll.insert({title: title, _id: o, commentcount: 0, comments: []})
        res.json({title: title, _id: o})
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if (err){
          console.log(err)
        }
        let coll = db.collection('books')
        coll.remove()
        res.send('complete delete successful')
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if (err) {
          console.log(err)
        }        
        let coll = db.collection('books')
                          
        coll.findOne({_id: ObjectId(bookid)},{commentcount: 0},(err,doc)=>{
          if (!doc) {
            res.send('no book exists')
            return
          }          
            res.json(doc)          
        })
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if (err) {
          console.log(err)
        }
        let coll = db.collection('books')
        if (!bookid || !comment) {
          res.send('missing title')
          return
        }
        coll.findOneAndUpdate({_id: ObjectId(bookid)},
        {$push:{comments: [comment]},$inc:{commentcount: 1}},(err,doc)=>{
          if (err){
            console.log(err)
          }
        })
        coll.findOne({_id: ObjectId(bookid)},{commentcount:0},(err,doc)=>{
          if (err) {
            console.log(err)
          }
          res.json(doc)
        })
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING,(err,db)=>{
        if (err) {
          console.log(err)
        }
        let coll = db.collection('books')
        coll.findOneAndDelete({_id: ObjectId(bookid)},(err,doc)=>{
          if (!doc) {
            res.send('no book exists')
          }
          res.send('delete successful')
        })
      })
    });
  
};
