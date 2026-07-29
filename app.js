const models = Array.isArray(window.OPENLUX_CATALOG) ? window.OPENLUX_CATALOG : [];
const state = { vendor: '全部供应商', type: '全部类型', tag: '全部标签', billing: '全部类型', query: '', page: 1 };
const expanded = { vendor: false, type: false, tag: false, billing: false };
const PAGE_SIZE = 30;
const grid = document.querySelector('#modelGrid');
const pagination = document.querySelector('#pagination');
const summary = document.querySelector('#resultSummary');
const empty = document.querySelector('#empty');
const toast = document.querySelector('#toast');
let toastTimer;

const billLabel = quota => ({0:'按量计费',1:'按次计费',3:'按视频尺寸计费',4:'按视频时间计费'}[quota] || '其他计费');
const countBy = getter => models.reduce((map, model) => map.set(getter(model), (map.get(getter(model)) || 0) + 1), new Map());
const vendorCounts = countBy(model => model.v);
const typeCounts = countBy(model => model.y);
const billingCounts = countBy(model => billLabel(model.q));
const tagCounts = models.reduce((map, model) => { model.g.forEach(tag => map.set(tag, (map.get(tag) || 0) + 1)); return map; }, new Map());

function topEntries(map, limit) { return [...map.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit); }
function preferredEntries(map, names) { return names.filter(name=>map.has(name)).map(name=>[name,map.get(name)]); }
function orderedEntries(map, preferred) {
  const preferredSet = new Set(preferred);
  return [...preferredEntries(map,preferred), ...[...map.entries()].filter(([name])=>!preferredSet.has(name)).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))];
}
function filterMarkup(title, allLabel, entries, key) {
  const selected = state[key];
  const visibleEntries = expanded[key] ? entries : entries.slice(0,5);
  const toggle = entries.length>5 ? `<button class="expand" data-expand="${key}" aria-expanded="${expanded[key]}"><span>${expanded[key]?'⌃':'⌄'}</span> ${expanded[key]?'收起':'展开更多'}</button>` : '';
  return `<h2>${title}</h2><button class="filter-item ${selected===allLabel?'selected':''}" data-key="${key}" data-value="${escapeHtml(allLabel)}"><span>${allLabel}</span><b>${models.length}</b></button><div class="filter-options">${visibleEntries.map(([name,count])=>`<button class="filter-item ${selected===name?'selected':''}" data-key="${key}" data-value="${escapeHtml(name)}"><span><i class="filter-dot"></i>${escapeHtml(name)}</span><b>${count}</b></button>`).join('')}</div>${toggle}`;
}
function renderFilters() {
  document.querySelector('#vendorFilter').innerHTML = filterMarkup('供应商','全部供应商',orderedEntries(vendorCounts,['OpenAI','Anthropic','Google','OpenAI Plus','DeepSeek']),'vendor');
  document.querySelector('#typeFilter').innerHTML = filterMarkup('模型类型','全部类型',orderedEntries(typeCounts,['对话','检索','图像','文本','音视频']),'type');
  document.querySelector('#tagFilter').innerHTML = filterMarkup('标签','全部标签',orderedEntries(tagCounts,['参考生视频','参考图','动作模仿','对话','对口型']),'tag');
  document.querySelector('#billingFilter').innerHTML = filterMarkup('计费类型','全部类型',orderedEntries(billingCounts,['按量计费','按次计费','按视频尺寸计费','按视频时间计费']),'billing');
  document.querySelectorAll('.filter-item').forEach(button => button.addEventListener('click', () => { state[button.dataset.key] = button.dataset.value; state.page = 1; renderFilters(); render(); }));
  document.querySelectorAll('.expand').forEach(button => button.addEventListener('click',()=>{expanded[button.dataset.expand]=!expanded[button.dataset.expand];renderFilters()}));
}
function filteredModels() {
  const needle = state.query.toLowerCase();
  return models.filter(model =>
    (state.vendor==='全部供应商'||model.v===state.vendor) &&
    (state.type==='全部类型'||model.y===state.type) &&
    (state.tag==='全部标签'||model.g.includes(state.tag)) &&
    (state.billing==='全部类型'||billLabel(model.q)===state.billing) &&
    (!needle||model.n.toLowerCase().includes(needle))
  );
}
function vendorMark(vendor) {
  const marks = {'OpenAI':'◎','OpenAI Plus':'◎','Anthropic':'✳','Google':'✦','DeepSeek':'◒','Grok (xAI)':'𝕏','Moonshot':'◐','阿里巴巴':'Q','Mistral':'M','字节跳动':'豆','Meta':'∞','Minimax':'M','Kling':'K','Doubao':'豆','Bailian':'Q'};
  return marks[vendor] || vendor.slice(0,1).toUpperCase();
}
function vendorClass(vendor) { return 'vendor-'+vendor.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function card(model) {
  return `<article class="card"><div class="card-head"><div class="logo ${vendorClass(model.v)}"><span>${escapeHtml(vendorMark(model.v))}</span></div><span class="type-pill">${escapeHtml(model.y)}</span></div><h3>${escapeHtml(model.n)}</h3><div class="vendor">${escapeHtml(model.v)}</div><p>${escapeHtml(model.d)}</p><div class="prices">${model.p.map(line=>{const split=line.indexOf(' ');return `<div class="price-row"><span>${escapeHtml(line.slice(0,split))}</span><strong>${escapeHtml(line.slice(split+1))}</strong></div>`}).join('')}</div><div class="tags">${model.g.slice(0,4).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}<span class="billing">● ${billLabel(model.q)}</span></div><div class="card-foot"><button class="copy" type="button" data-name="${encodeURIComponent(model.n)}" aria-label="复制模型名称 ${escapeHtml(model.n)}">▣</button></div></article>`;
}
function renderPagination(totalPages) {
  if (totalPages <= 1) { pagination.innerHTML=''; return; }
  const pages = [...new Set([1,2,state.page-1,state.page,state.page+1,totalPages-1,totalPages].filter(page=>page>=1&&page<=totalPages))].sort((a,b)=>a-b);
  let last = 0;
  const pageButtons = pages.map(page => { const gap = page-last>1 ? '<span>…</span>' : ''; last=page; return `${gap}<button data-page="${page}" class="${page===state.page?'active':''}">${page}</button>`; }).join('');
  pagination.innerHTML = `<button data-page="${state.page-1}" ${state.page===1?'disabled':''}>‹</button>${pageButtons}<button data-page="${state.page+1}" ${state.page===totalPages?'disabled':''}>›</button><span class="page-size">每页条数：30</span>`;
  pagination.querySelectorAll('button[data-page]').forEach(button => button.addEventListener('click', () => { if(button.disabled)return; state.page=Number(button.dataset.page); render(); document.querySelector('.content').scrollIntoView({behavior:'smooth'}); }));
}
function render() {
  const found = filteredModels();
  const totalPages = Math.max(1, Math.ceil(found.length/PAGE_SIZE));
  if (state.page>totalPages) state.page=totalPages;
  const start=(state.page-1)*PAGE_SIZE;
  grid.innerHTML=found.slice(start,start+PAGE_SIZE).map(card).join('');
  summary.textContent=`共 ${found.length} 个模型 · 第 ${state.page} / ${totalPages} 页`;
  empty.hidden=found.length>0;
  grid.querySelectorAll('.copy').forEach(button => button.addEventListener('click',()=>copyName(decodeURIComponent(button.dataset.name),button)));
  renderPagination(totalPages);
}
async function copyName(name, button) {
  try { await navigator.clipboard.writeText(name); } catch { const input=document.createElement('textarea'); input.value=name; document.body.append(input); input.select(); document.execCommand('copy'); input.remove(); }
  button.textContent='✓'; button.classList.add('done'); toast.textContent=`已复制：${name}`; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),1500); setTimeout(()=>{button.textContent='▣';button.classList.remove('done')},1100);
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
document.querySelector('#search').addEventListener('input',event=>{state.query=event.target.value;state.page=1;render()});
document.querySelector('#reset').addEventListener('click',()=>{Object.assign(state,{vendor:'全部供应商',type:'全部类型',tag:'全部标签',billing:'全部类型',query:'',page:1});Object.keys(expanded).forEach(key=>expanded[key]=false);document.querySelector('#search').value='';renderFilters();render()});
renderFilters(); render();
