import './style.css';

const status = document.querySelector('#status');
const button = document.querySelector('#ping');

button?.addEventListener('click', () => {
  if (!status) return;
  const now = new Date();
  status.textContent = `已收到点击：${now.toLocaleString('zh-CN')}`;
});
