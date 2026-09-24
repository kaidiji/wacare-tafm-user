import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Demo 模式：每次重新整理頁面都清除本機儲存的示範資料，回到初次登入的狀態。
try {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('wacare_'))
    .forEach((key) => localStorage.removeItem(key));
} catch {
  /* 瀏覽器不允許存取 localStorage 時略過 */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
