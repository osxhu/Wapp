const app = getApp();
const db = wx.cloud.database();
var id = '';
var teachers = [];
var time = '';
var place = '';
var openid = '';
Page({
  data: {
    modalName: null,
    place: [],
    status: true,
    comment: [],
    teachers: [],
    teaInf: {},
    swiperList: [{
      id: 0,
      url: ''
    }, {
      id: 1,
      url: '',
    }, {
      id: 2,
      url: ''
    }],
  },

  addComment: function(res) {
    wx.navigateTo({
      url: '../comment/comment',
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  order: function(res) {
    this.setData({
      modalName: 'bottomModal',
    })
  },

  change: function(e) {
    console.log(e)
    time = e.detail.value;
  },

  change2: function(e) {
    console.log(e)
    place = e.detail.value;
  },

  submit: function(e) {
    if ((time && place) == '') {
      console.log('错误')
      wx.showModal({
        title: '错误',
        content: '请将所有选项选完',
      })
    } else {
      wx.showLoading({
        title: '提交中',
      })
      wx.cloud.callFunction({
        name: 'template',
        data: {
          openid: openid,
          formid: e.detail.formId,
          name: this.data.teaInf.name,
          place: place,
          time: time,
        },
        success: res => {
          wx.hideLoading();
          console.log(res);
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            success: function(res) {
              wx.navigateTo({
                url: '../orderinfo/orderinfo',
              })
            },
            fail: function(res) {
              console.error
            },
            complete: function(res) {
              wx.navigateTo({
                url: '../orderinfo/orderinfo',
              })
            },
          })
        },
        fail: console.error
      })

      db.collection('userInfo').doc(id).update({
        data: {
          order: {
            tea: this.data.teaInf.name,
            place: place,
            time: time,
          }
        }
      })
    }
  },

  onLoad: function(options) {
    db.collection('userInfo').get({
      success: e => {
        id = e.data[0]._id;
        openid = e.data[0]._openid;
      }
    })
    db.collection('teacherInfo').get({
      success: res => {
        teachers = res.data[0].teachers; //拿到关于教师数据
        for (let i = 0; i <= teachers.length; i++) {
          if (teachers[i].name == app.globalData.teacher) {
            this.setData({
              teaInf: teachers[i], //筛选出选中的教师数据
            })
            this.setData({
              swiperList: [{
                id: 0,
                url: this.data.teaInf.pic
              }, {
                id: 1,
                url: this.data.teaInf.pic2
              }, {
                id: 2,
                url: this.data.teaInf.pic3
              }],
            })

            db.collection('comment').doc(this.data.teaInf.name).get({
              success: e => {
                this.setData({ //获取相应评论
                  comment: e.data.comment
                })
              }
            })
          }
        }
      }
    })
    db.collection('place').get({
      success: e => {
        this.setData({
          place: e.data[0].place
        })
      },
      fail: console.error
    })
  },
})