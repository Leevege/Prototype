;(function(){
    'use strict';
    // 封装Object.assign方法
    function copy(obj){
        return Object.assign({},obj);
    }
    // 封装按照中英文计算字符串长度的方法
    function getLenOfCNorEN(val) {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
             var a = val.charAt(i);
             if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            } else {
                len += 1;
            }
        }
        return len;
    }
    new Vue({
        el:'#main',
        data:{
            // 任务列表
            list:[],
            // 当前文字输入区
            current:{},
        },
        mounted: function(){
            this.list = ms.get('list') || this.list;
        },
        methods:{
            // 用一个方法判断添加还是更新
            merge: function(){
                var is_update, id;
                id = is_update = this.current.id;
                if(is_update){
                    var index = this.find_index(id);
                    Vue.set(this.list, index, copy(this.current));
                } else {
                    var currentTitle = this.current.title;
                    if(!currentTitle && currentTitle !== 0){
                        return;
                    } else if(getLenOfCNorEN(currentTitle) > 40){
                        alert('输入的字符太长，请缩减！');
                        return;
                    }
                    var todo = copy(this.current);
                    todo.id = this.next_id();
                    this.list.unshift(todo);
                }
                this.reset_current();
            },
            remove: function(id){
                var index = this.find_index(id);
                this.list.splice(index,1);
            },
            next_id: function(){
                return this.list.length + 1;
            },
            set_current: function(todo){
                this.current = copy(todo);
                console.log('success');
            },
            reset_current: function(){
                this.set_current({});
            },
            find_index: function(id){
                return this.list.findIndex(function(item){
                    return item.id == id;
                });
            },
        },
        watch:{
            list:{
                deep:true,
                handler: function(new_val, old_val){
                    if(new_val){
                        ms.set('list',new_val);
                    } else {
                        ms.set('list',[]);
                    }
                }
            }
        }
    });
})();