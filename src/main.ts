import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { GlobalCmComponent } from 'codemirror-editor-vue3';

// import 'codemirror/addon/hint/show-hint';
// import 'codemirror/addon/hint/show-hint.css';
// import 'codemirror/addon/hint/sql-hint';

// import JsonViewer from 'vue3-json-viewer';
// import 'vue3-json-viewer/dist/index.css';

createApp(App)
    .use(GlobalCmComponent)
    // .use(JsonViewer)
    .mount('#app');
