import { createApp } from 'vue';
import App from './App.vue';
import RemoteSensing from './RemoteSensing.vue';
import { Select, Row, Col, DatePicker, Table } from 'ant-design-vue';

const app = createApp(RemoteSensing);

const appEl = document.createElement('div');
appEl.className = 'rootcon';
document.body.appendChild(appEl);
app.use(Select).use(Row).use(Col).use(DatePicker).use(Table).mount(appEl);
