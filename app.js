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
        currentUser: null,
        actionType: 'signUp',
        formData: {
          username: '',
          password: ''
        },
    },
    created: function(){
        this.currentUser = this.getCurrentUser();  //添加执行

        this.fetchTodos()  //将原来的一坨代码取一个名字叫做fetchTodos
    },
    methods: {
        fetchTodos:function(){
          if(this.currentUser){
            var query = new AV.Query('AllTodos');
            query.find().then((todos) => {
                let avAllTodos = todos[0] // 因为理论上 AllTodos 只有一个，所以我们取结果的第一项
                let id = avAllTodos.id
                this.todoList = JSON.parse(avAllTodos.attributes.content) // 为什么有个 attributes？因为我从控制台看到的
                this.todoList.id = id // 为什么给 todoList 这个数组设置 id？因为数组也是对象啊
              }, function(error){
                console.log(error) 
              })
          }
        },
        updateTodos: function(){
          // 想要知道如何更新对象，先看文档 https://leancloud.cn/docs/leanstorage_guide-js.html#更新对象
          let dataString = JSON.stringify(this.todoList) // JSON 在序列化这个有 id 的数组的时候，会得出怎样的结果？
          let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
          avTodos.set('content', dataString)
          avTodos.save().then(()=>{
            console.log('更新成功')
          })
        },
        saveTodos: function(){
          let dataString = JSON.stringify(this.todoList)
          var AVTodos = AV.Object.extend('AllTodos');
          var avTodos = new AVTodos();

          var acl = new AV.ACL()
          acl.setReadAccess(AV.User.current(),true) // 只有这个 user 能读
          acl.setWriteAccess(AV.User.current(),true) // 只有这个 user 能写

          
          avTodos.setACL(acl) //设置访问控制
          avTodos.set('content', dataString);
          avTodos.save().then((todo) => {
            this.todoList.id = todo.id  // 一定要记得把 id 挂到 this.todoList 上，否则下次就不会调用 updateTodos 了
            console.log('保存成功');
          }, function (error) {
            alert('保存失败');
          });
        },
        addTodo: function(){
          this.todoList.push({
            title: this.newTodo,
            createdAt: new Date().toLocaleString(),
            done:false
          })
          this.newTodo = ''
          this.saveOrUpdateTodos() // 不能用 saveTodos 了
        },
        removeTodo: function(todo){
            let index = this.todoList.indexOf(todo) // Array.prototype.indexOf 是 ES 5 新加的 API
            this.todoList.splice(index,1) // 不懂 splice？赶紧看 MDN 文档！
            this.saveOrUpdateTodos() // 不能用 saveTodos 了
        },
        saveOrUpdateTodos: function(){
          if(this.todoList.id){
            this.updateTodos()
          }else{
            this.saveTodos()
          }
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
              console.log(error)
            });
          },
          login: function () {
            AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => {
              this.currentUser = this.getCurrentUser()
              this.fetchTodos() // 登录成功后读取 todos
            }, function (error) {
              alert('登录失败')
              console.log(error)
            })
          },
          getCurrentUser: function () {
            let currentUser = AV.User.current();
            if (currentUser) {
              let {id, createdAt, attributes: {username}} = currentUser
              // ES 6 新特性列表：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
              return {id, username, createdAt} // 看文档：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Object_initializer#ECMAScript_6%E6%96%B0%E6%A0%87%E8%AE%B0
            } else {
               return null
            }
          },
          logout:function(){
            AV.User.logOut();
            // 现在的 currentUser 是 null 了
            let currentUser = AV.User.current();
            window.location.reload()
            // AV.User.logOut()
            // this.currentUser = null
            // window.location.reload()
          }
    }
})
