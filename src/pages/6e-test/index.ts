import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

const appEl = document.createElement('div');
appEl.className = 'rootcon';
document.body.appendChild(appEl);
app.mount(appEl);
