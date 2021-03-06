'use strict'
import ArticleModel from '../../models/article/article'
import UserModel from '../../models/user/user'
import BaseComponent from '../../prototype/BaseComponent'
import moment from 'moment'
import WangYiNews from '../../spider/WangYiNews'
import { ajax } from '../../api/ajax'

class articleMethod extends BaseComponent{
  constructor(){
    super()
    this.newsType = {
      '娱乐': 'BA10TA81wangning',
      '电视': 'BD2A86BEwangning',
      '电影': 'BD2A9LEIwangning',
      '明星': 'BD2AB5L9wangning',
      '音乐': 'BD2AC4LMwangning',
      '体育': 'BA8E6OEOwangning',
      '财经': 'BA8EE5GMwangning',
      '军事': 'BAI67OGGwangning',
      '军情': 'DE0CGUSJwangning',
      '健康': 'BDC4QSV3wangning',
      '科技': 'BA8D4A3Rwangning',
      '手机': 'BAI6I0O5wangning',
      '艺术': 'CKKS0BOEwangning',
      '旅游': 'BEO4GINLwangning'
    }

    this.city = ['北京', '武汉', '深圳', '广州', '上海', '杭州', '成都', '深圳', '北京', '上海', '深圳', '北京', '深圳' ]
  }
  async createNewsData(data) {
    let arr = []
    if(typeof data == 'undefined') return
    if(!Array.isArray(data)){
      arr.push(data)
      data = arr
    }
    try {
      for (let i of data) {
        const isValue = await this.findIsValue(ArticleModel, {
          source_id: i.source_id
        })
        if (!isValue) {
          const article_id = await this.getId('article_id')
          i.id = article_id
          await ArticleModel.create(i)
          // 创建一个用户
          await this.createDefaultUserData(i)
          //获取该新闻的评论并添加进数据库
          this.createNewsHotComment(i.source_id)
          // this.getNewsComment(i.source_id, '网易')
        }
      }
    } catch (err) {
      throw Error(err)
    }
  }

  // 创建一个默认的用户
  async createDefaultUserData({ author, avatar }) {
    try{
      const isValue = await this.findIsValue(UserModel, { username: author})
      if(!isValue){
        const user_id = await this.getId('user_id')
        let obj = {
          id: user_id,
          nickname: author,
          username: author,
          avatar,
          create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          update_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          password: '123456',
          address: this.city[Math.floor(Math.random() * this.city.length )],
        }
        await UserModel.create(obj)
      }
    } catch(err) {
      throw Error(err)
    }
  }

  // 创建热评添加进数据库
  async createNewsHotComment(id){
    let hotComments = await WangYiNews.getIdHotComment(id)
    //评论添加进数据库
    this.fetch('http://localhost:4001/comment/addNewsComment', {
      comment: hotComments,
      articleId: id
    }, 'POST')
  }

  // 根据网易新闻url获取新闻内容
  async getNewsContentByWY(url){
    let result = await WangYiNews.getNewsContent(url)
    result.content = result.content.replace(/data-src/g, 'src')
    return result
  }

  // 获取所有类型的新闻
  async getAllTypeNews(){
    for(let i in this.newsType){
      let result = await ajax(`https://3g.163.com/touch/reconstruct/article/list/${this.newsType[i]}/0-20.html`)
      result = eval('this.' + result)[this.newsType[i]]
      for(let item of result) {
        // 内容和描述有一个为空时
        if ((!item.skipURL && !item.url) || (!item.digest && !item.description))
          continue
        let obj = {
          create_time: item.ptime,
          update_time: item.ptime,
          commentCount: item.commentCount,
          voteCount: 0,
          author: item.source,
          title: item.title,
          source_id: item.docid,
          user_id: 1,
          coverImg: item.imgsrc,
          category: i,
          content: item.skipURL || item.url,
          description: item.digest || item.description || '',
          avatar: 'http://www.163.com/favicon.ico',
          source_address: '网易'
        }
        await this.createNewsData(obj)
      }
    }
  }
  test(){
    console.log('测试')
  }
  artiList(result) {
    return result
  }
  //从数组随机选取几个元素
  getRandomArrayElements(arr, count) {
    let shuffled = arr.slice(0),
      i = arr.length,
      min = i - count,
      temp,
      index;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }
}

export default new articleMethod