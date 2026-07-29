const allModels = Array.isArray(window.OPENLUX_MODELS) ? window.OPENLUX_MODELS : [];
const grid = document.querySelector('#modelGrid');
const count = document.querySelector('#modelCount');
const empty = document.querySelector('#empty');
const more = document.querySelector('#loadMore');
const toast = document.querySelector('#toast');
let query = '', activeVendor = '全部厂商', shown = 48, ascending = true, toastTimer;

function vendorOf(name) {
  const rules = [['OpenAI',/^(gpt|o[134]|text-|tts-|whisper|dall-e|chatgpt)/i],['Anthropic',/claude/i],['Google',/gemini|palm|imagen/i],['DeepSeek',/deepseek/i],['通义千问',/qwen|tongyi/i],['智谱 AI',/glm|chatglm/i],['Moonshot',/kimi|moonshot/i],['xAI',/grok/i],['MiniMax',/minimax|abab/i],['火山引擎',/doubao|seedance/i],['百度',/ernie|baidu/i],['腾讯',/hunyuan/i],['Meta',/llama/i],['Mistral AI',/mistral/i],['可灵 AI',/kling/i],['微软',/phi/i]];
  return (rules.find(([, rule]) => rule.test(name)) || ['其他'])[0];
}
function items() {
  return allModels.filter(name => (activeVendor === '全部厂商' || vendorOf(name) === activeVendor) && name.toLowerCase().includes(query.toLowerCase())).sort((a,b) => ascending ? a.localeCompare(b) : b.localeCompare(a));
}
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1600); }
async function copyModel(name, button) {
  try { await navigator.clipboard.writeText(name); } catch { const input = document.createElement('textarea'); input.value = name; document.body.append(input); input.select(); document.execCommand('copy'); input.remove(); }
  button.textContent = '已复制'; button.classList.add('done'); showToast(`已复制：${name}`); setTimeout(() => { button.textContent = '复制'; button.classList.remove('done'); }, 1200);
}
function render() {
  const found = items(), visible = found.slice(0, shown);
  count.textContent = `共 ${found.length} / ${allModels.length} 个模型`;
  grid.innerHTML = visible.map(name => `<article class="card"><div class="card-top"><h3 class="model-name">${escapeHtml(name)}</h3><button class="copy" type="button" data-name="${encodeURIComponent(name)}">复制</button></div><div class="vendor-name">${vendorOf(name)}</div></article>`).join('');
  grid.querySelectorAll('.copy').forEach(button => button.addEventListener('click', () => copyModel(decodeURIComponent(button.dataset.name), button)));
  empty.hidden = Boolean(found.length); more.hidden = shown >= found.length || !found.length;
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function renderVendors() {
  const vendors = ['全部厂商', ...new Set(allModels.map(vendorOf))];
  document.querySelector('#vendors').innerHTML = vendors.map(v => `<button class="vendor ${v === activeVendor ? 'active' : ''}" data-vendor="${v}">${v}</button>`).join('');
  document.querySelectorAll('.vendor').forEach(button => button.addEventListener('click', () => { activeVendor = button.dataset.vendor; shown = 48; renderVendors(); render(); }));
}
document.querySelector('#search').addEventListener('input', event => { query = event.target.value; shown = 48; render(); });
document.querySelector('#sortButton').addEventListener('click', event => { ascending = !ascending; event.currentTarget.textContent = ascending ? '名称排序 A–Z' : '名称排序 Z–A'; render(); });
more.addEventListener('click', () => { shown += 48; render(); });
renderVendors(); render();
