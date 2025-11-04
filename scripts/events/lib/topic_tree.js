/**
 * topic.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 用于专栏/专题文章，一个专栏类似于 wiki 模块中的一个项目文档
 * 区别是：
 * 1. 按发布日期排序，无需手动排序
 * 
 */

'use strict';

class RelatedPage {
  constructor(page) {
    this.id = page._id
    this.wiki = page.wiki
    this.topic = page.topic
    this.title = page.title
    this.path = page.path
    this.path_key = page.path.replace('.html', '')
    this.layout = page.layout
    this.date = page.date
    this.updated = page.updated
  }
}

function getTopicTree(ctx) {
  const tree = {};
  const data = ctx.locals.get('data')
  const list = [];
  for (let key of Object.keys(data)) {
    if (key.endsWith('.DS_Store')) {
      continue
    }
    if (key.startsWith('topic/') && key.length > 5) {
      let newKey = key.replace('topic/', '')
      let obj = data[key]
      obj.id = newKey
      if (!obj.order_by) {
        obj.order_by = '-date'
      }
      if (!obj.path) {
        obj.path = `/topic/${newKey}/`
      }
      if (!obj.tree) {
        obj.tree = []
      }
      obj.pages = []
      list.push(obj)
    }
  }
  for (let item of list) {
    tree[item.id] = item
  }
  return tree
}

module.exports = ctx => {
  const topic = ctx.locals.get('data').topic || {};
  // 专栏结构树
  topic.tree = getTopicTree(ctx)
  // 索引页显示的专栏列表
  if (topic.publish_list == null) {
    topic.publish_list = ctx.locals.get('data').topics || []
  }

  // 配置 topic 页面
  const pages = ctx.locals.get('pages')
  const topicPages = pages.filter(p => p.topic).map(p => new RelatedPage(p))
  const topicList = Object.keys(topic.tree).filter(id => topicPages.some(p => p.topic === id))

  // 将 page 添加到 topic.tree
  for (const topicName of topicList) {
    const pages = topicPages.filter(p => p.topic === topicName)
    const topicObject = topic.tree[topicName]
    if (topicObject) {
      const includedPages = pages.filter(page => topicObject.tree.some(id => "/" + page.path_key === topicObject.path + id))
      includedPages.forEach((page, index) => page.page_number = index + 1)
      topicObject.pages = includedPages
    }
  }

  // topic homepage
  for (let tid of topicList) {
    let topicObject = topic.tree[tid]
    if (topicObject.order_by === '-date') {
      topicObject.pages = topicObject.pages.reverse()
    }
    topicObject.homepage = topicObject.pages[0]
  }

  ctx.theme.config.topic = topic
}
