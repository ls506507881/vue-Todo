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
            user.signUp().then(function (loginedUser) {
              console.log(loginedUser);
            }, function (error) {
            });
          }
    }
})