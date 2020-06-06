import Vue from 'vue'
import App from './App.vue'
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import highchartsMore from 'highcharts/highcharts-more'
import './quasar'
// import vClickOutside from "v-click-outside";


Vue.config.productionTip = false
highchartsMore(Highcharts);
Vue.use(HighchartsVue /* , vClickOutside */ )

// Root instance
new Vue({
  el: '#app',
  render: h => h(App),

}).$mount('#app')

