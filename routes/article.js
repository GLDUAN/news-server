'use strict'
import express from 'express'
import Article from '../controller/article/article'
const router = express.Router()

router.get('/addArticle', Article.addArticle)   //添加文章
router.get('/getArticleContent', Article.getArticleContent) //获取新闻内容
router.get('/getCurrentNews', Article.getCurrentNews)  //获取实时新闻
router.get('/addNews', Article.addNews)
router.get('/test', Article.test)
router.get('/getNews', Article.getNews) //获取新闻
export default router