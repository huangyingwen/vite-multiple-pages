import { createApp } from 'vue';
import App from './App.vue';
import RemoteSensing from './RemoteSensing.vue';
import { Select, Row, Col, DatePicker, Table } from 'ant-design-vue';
import qs from 'qs';

const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
const app = createApp(query.yagan ? RemoteSensing : App);

const appEl = document.createElement('div');
appEl.className = 'rootcon';
document.body.appendChild(appEl);
app.use(Select).use(Row).use(Col).use(DatePicker).use(Table).mount(appEl);
