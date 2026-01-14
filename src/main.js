import './style.css';

const input = document.querySelector('#input');
const output = document.querySelector('#output');
const repairButton = document.querySelector('#repair');
const copyButton = document.querySelector('#copy');
const status = document.querySelector('#status');

const stripCodeFence = (text) => {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  return trimmed;
};

const repairJsonText = (text) => {
  let candidate = stripCodeFence(text);
  candidate = candidate.replace(/,\s*([}\]])/g, '$1');
  candidate = candidate.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');
  candidate = candidate.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
  return candidate;
};

const setStatus = (message, kind = 'info') => {
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
};

const handleRepair = () => {
  if (!input || !output) return;
  if (!input.value.trim()) {
    output.value = '';
    setStatus('请输入需要修复的内容。', 'warning');
    return;
  }
  const repaired = repairJsonText(input.value);
  try {
    const parsed = JSON.parse(repaired);
    output.value = JSON.stringify(parsed, null, 2);
    setStatus('修复完成 ✅', 'success');
  } catch (error) {
    output.value = repaired;
    setStatus(`仍无法解析，请检查格式：${error.message}`, 'error');
  }
};

const handleCopy = async () => {
  if (!output?.value) {
    setStatus('暂无可复制内容。', 'warning');
    return;
  }
  try {
    await navigator.clipboard.writeText(output.value);
    setStatus('已复制到剪贴板。', 'success');
  } catch (error) {
    setStatus(`复制失败：${error.message}`, 'error');
  }
};

repairButton?.addEventListener('click', handleRepair);
copyButton?.addEventListener('click', handleCopy);
