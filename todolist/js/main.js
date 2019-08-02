; (function () {
    if (!localStorage) (function () { document.write('<h1 style="text-align:center;">抱歉，这个浏览器不支持本地存储，所以功能不可用。</h1>'); return; })();
    'use strict';
    var Event = new Vue();
    var alert_sound = document.getElementById('Alert');
    // 封装Object.assign方法
    function copy(obj) {
        return Object.assign({}, obj);
    }
    // 封装按照中英文计算字符串长度的方法
    function getLenOfCNorEN(val) {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
            var a = val.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            } else {
                len += 1;
            }
        }
        return len;
    }
    // 组件化功能
    Vue.component('task', {
        template: '#task-tpl',
        props: ['todo'],
        methods: {
            action: function (name, params) {
                Event.$emit(name, params);
            }
        }
    })
    new Vue({
        el: '#main',
        data: {
            // 任务列表
            list: [],
            last_id: 0,
            // 当前文字输入区
            current: {},
        },
        mounted: function () {
            var me = this;
            this.list = ms.get('list') || this.list;
            this.last_id = ms.get('last_id') || this.last_id;
            setInterval(function () {
                me.check_alerts();
            }, 1000);
            Event.$on('remove', function (id) {
                if (id) {
                    me.remove(id);
                }
            });
            Event.$on('toggle_complete', function (id) {
                if (id) {
                    me.toggle_complete(id);
                }
            });
            Event.$on('set_current', function (id) {
                if (id) {
                    me.set_current(id);
                }
            });
            Event.$on('toggle_detail', function (id) {
                if (id) {
                    me.toggle_detail(id);
                }
            });
        },
        methods: {
            check_alerts: function () {
                var Me = this;
                this.list.forEach(function (row, i) {
                    var alert_at = row.alert_at;
                    if (!alert_at || row.alert_confirmed) return;
                    alert_at = (new Date(alert_at)).getTime();
                    var now = (new Date()).getTime();
                    if (now >= alert_at) {
                        // 自定义提示框，否则音频不正常播放
                        var confirmed = false;
                        alert_sound.play();
                        var DonePop = document.getElementsByClassName('DONE')[0];
                        var Hintwords = DonePop.getElementsByClassName('HintTitle')[0];
                        DonePop.style.display = 'block';
                        Hintwords.innerHTML = '任务：' + row.title + '已到期！';
                        DonePop.querySelector('button').onclick = function () {
                            DonePop.style.display = 'none';
                            confirmed = true;
                            Vue.set(Me.list[i], 'alert_confirmed', confirmed);
                            if(confirmed) alert_sound.pause();
                        };
                    }
                })
            },
            // 用一个方法判断添加还是更新
            merge: function () {
                var is_update, id;
                id = is_update = this.current.id;
                if (is_update) {
                    var index = this.find_index(id);
                    Vue.set(this.list, index, copy(this.current));
                } else {
                    var currentTitle = this.current.title;
                    if (!currentTitle && currentTitle !== 0) {
                        return;
                    } else if (getLenOfCNorEN(currentTitle) > 40) {
                        alert('输入的字符太长，请缩减！');
                        return;
                    }
                    var todo = copy(this.current);
                    this.last_id++;
                    ms.set('last_id', this.last_id);
                    todo.id = this.last_id;
                    this.list.unshift(todo);
                }
                this.reset_current();
            },
            toggle_detail: function (id) {
                var index = this.find_index(id);
                Vue.set(this.list[index], 'show_detail', !this.list[index].show_detail);
            },
            remove: function (id) {
                var index = this.find_index(id);
                this.list.splice(index, 1);
            },
            set_current: function (todo) {
                this.current = copy(todo);
                console.log('success');
            },
            reset_current: function () {
                this.set_current({});
            },
            find_index: function (id) {
                return this.list.findIndex(function (item) {
                    return item.id == id;
                });
            },
            toggle_complete: function (id) {
                var i = this.find_index(id);
                Vue.set(this.list[i], 'completed', !this.list[i].completed);
            }
        },
        watch: {
            list: {
                deep: true,
                handler: function (new_val, old_val) {
                    if (new_val) {
                        ms.set('list', new_val);
                    } else {
                        ms.set('list', []);
                    }
                }
            }
        }
    });
})();