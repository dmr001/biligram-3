import Vue from 'vue'
import App from './App.vue'
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import highchartsMore from 'highcharts/highcharts-more'
import highChartsDebugger from 'highcharts/modules/debugger'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import InitService from '@/store/services/InitService.js'
import NProgress from 'nprogress';

Vue.config.productionTip = false
highchartsMore(Highcharts);
highChartsDebugger(Highcharts);
Vue.use(HighchartsVue);

InitService.load().then(data => {
  NProgress.configure({
    parent: "#app",
  })
  NProgress.start()
  store.dispatch('init', data)
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app');
}).catch(e => {
  alert('Error initializing:' + e)
}).finally(() => {
  store.commit("changeDataReady", true);
  console.log("dataReady set to true in main.js");
  NProgress.done();
})
