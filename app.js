import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = '9oQvjfEkhpAeDRQjgXuj4Gmv-gzGzoHsz';
var APP_KEY = '7VMJFEWMRqerroDgeBKvhlcm';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

var app = new Vue({
    el: '#app',
    data: {
        newTodo: '',
        todoList: [],
        currentUser:'',
        actionType: 'signUp',
        formData: {
          username: '',
          password: ''
        },
    },
    created: function(){
        // onbeforeunload文档：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onbeforeunload
        window.onbeforeunload = ()=>{
          let dataString = JSON.stringify(this.todoList) // JSON 文档: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON
          window.localStorage.setItem('myTodos', dataString) // 看文档https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage
        }
        let oldDataString = window.localStorage.getItem('myTodos')
        let oldData = JSON.parse(oldDataString)
        this.todoList = oldData || []
    },
    methods: {
        addTodo: function(){
          this.todoList.push({
            title: this.newTodo,
            createdAt: new Date().toLocaleString(),
            done:false
          })
          this.newTodo = ''
        },
        removeTodo: function(todo){
            let index = this.todoList.indexOf(todo) // Array.prototype.indexOf 是 ES 5 新加的 API
            this.todoList.splice(index,1) // 不懂 splice？赶紧看 MDN 文档！
        },
        signUp: function () {   
            // 新建 AVUser 对象实例         
            let user = new AV.User();
            // 设置用户名
            user.setUsername(this.formData.username);
            // 设置密码
            user.setPassword(this.formData.password);
            user.signUp().then((loginedUser) => {
              this.currentUser = this.getCurrentUser() 
            }, (error) => {
              alert('注册失败') 
            });
          },
          login: function () {
            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
              this.currentUser = this.getCurrentUser()
            }, function (error) {
              alert('登录失败')
            })
          },
          getCurrentUser: function () { 
            let {id, createdAt, attributes: {username}} = AV.User.current()
            // ES 6 新特性列表：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
            return {id, username, createdAt} // 看文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Object_initializer#ECMAScript_6%E6%96%B0%E6%A0%87%E8%AE%B0
          },
          logout:function(){
            AV.User.logOut();
            // 现在的 currentUser 是 null 了
            var currentUser = AV.User.current();
            window.location.reload()
            // AV.User.logOut()
            // this.currentUser = null
            // window.location.reload()
          }
    }
})