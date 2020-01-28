import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Home from '@/components/Home'
import Players from '@/components/Players'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/hello', name: 'HelloWorld', component: HelloWorld },
    { path: '/players', name: 'Players', component: Players }
  ]
})