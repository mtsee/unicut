export function getInitData() {
  return {
    source_id: '', //来源Id
    category_id: 0, //分类Id
    name: '未命名', //名称
    description: '未命名', //描述
    duration: 0, //时长（毫秒）
    width: 1920, //宽度
    height: 1080, //高度
    thumb: '', //封面图url
    data: {
      title: '未命名',
      createTime: 0,
      updateTime: 0,
      poster: '',
      width: 1920,
      height: 1080,
      background: {},
      transitions: [],
      cameras: [],
      captions: [],
      elements: [],
      resouces: [],
    }, //数据
  };
}
