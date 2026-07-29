const models = [
  ['GPT-4.1','OpenAI','文本对话','旗舰级通用模型，擅长复杂推理、代码与长文本任务。','¥12.00 / 1M tokens','text'],
  ['GPT-4o','OpenAI','视觉理解','高性能多模态模型，支持文本、图像与实时交互。','¥5.00 / 1M tokens','vision'],
  ['o3','OpenAI','文本对话','面向复杂推理与编程工作流的深度思考模型。','¥30.00 / 1M tokens','text'],
  ['Claude Opus 4.1','Anthropic','文本对话','为复杂任务、智能体与高质量创作而生。','¥75.00 / 1M tokens','text'],
  ['Claude Sonnet 4','Anthropic','视觉理解','速度与智能兼备的日常工作主力模型。','¥18.00 / 1M tokens','vision'],
  ['Gemini 2.5 Pro','Google','视觉理解','原生多模态、长上下文与深度推理能力。','¥14.00 / 1M tokens','vision'],
  ['Gemini 2.5 Flash','Google','文本对话','快速响应、低成本的高性价比多模态模型。','¥2.50 / 1M tokens','text'],
  ['DeepSeek-V3','DeepSeek','文本对话','高性价比的通用对话与代码生成模型。','¥2.00 / 1M tokens','text'],
  ['DeepSeek-R1','DeepSeek','文本对话','擅长数学、代码与逻辑推理的深度思考模型。','¥4.00 / 1M tokens','text'],
  ['Qwen3-235B','通义千问','文本对话','强大的中文理解、工具调用与推理能力。','¥4.50 / 1M tokens','text'],
  ['Qwen2.5-VL','通义千问','视觉理解','图像、文档与视频理解的一体化模型。','¥3.00 / 1M tokens','vision'],
  ['GLM-4.5','智谱 AI','文本对话','面向智能体任务的推理、代码与工具模型。','¥3.20 / 1M tokens','text'],
  ['Kimi K2','Moonshot','文本对话','超长上下文与复杂工具调用任务的可靠选择。','¥5.50 / 1M tokens','text'],
  ['Grok 4','xAI','文本对话','实时感知与强推理能力的通用大语言模型。','¥26.00 / 1M tokens','text'],
  ['MiniMax-M1','MiniMax','文本对话','支持长链推理与高效输出的国产模型。','¥2.80 / 1M tokens','text'],
  ['Doubao-Seed','火山引擎','视觉理解','字节跳动的原生多模态模型系列。','¥4.00 / 1M tokens','vision'],
  ['FLUX.1 Kontext','Black Forest','图像生成','高保真生成与图像编辑，细节表现出色。','¥0.12 / 张','image'],
  ['gpt-image-1','OpenAI','图像生成','遵循提示词准确、支持高品质图片创作。','¥0.14 / 张','image'],
  ['Sora 2','OpenAI','视频生成','根据自然语言描述生成连贯的视频片段。','¥1.20 / 秒','video'],
  ['Kling 2.1','可灵 AI','视频生成','电影级运动表现与高质量文生视频能力。','¥0.85 / 秒','video'],
  ['Eleven Multilingual','ElevenLabs','语音音频','自然、富表现力的多语言语音合成。','¥0.18 / 1K 字符','audio'],
  ['Whisper','OpenAI','语音音频','强大的多语言自动语音识别模型。','¥0.04 / 分钟','audio'],
  ['Llama 4 Maverick','Meta','视觉理解','开放权重的专家混合多模态模型。','¥3.00 / 1M tokens','vision'],
  ['Mistral Large','Mistral AI','文本对话','适合企业级多语言任务的高效模型。','¥8.00 / 1M tokens','text']
];
const colors={OpenAI:'#121212',Anthropic:'#bd7445',Google:'#4285f4',DeepSeek:'#496bf2','通义千问':'#7669ee','智谱 AI':'#207dff',Moonshot:'#20242d',xAI:'#111',MiniMax:'#3e8eff','火山引擎':'#ea5b43','Black Forest':'#383838','可灵 AI':'#5f55e8',ElevenLabs:'#191919',Meta:'#1877f2','Mistral AI':'#f45c37'};
const initials={OpenAI:'◌',Anthropic:'A',Google:'G',DeepSeek:'D','通义千问':'Q','智谱 AI':'Z',Moonshot:'M',xAI:'x',MiniMax:'M','火山引擎':'⌁','Black Forest':'B','可灵 AI':'K',ElevenLabs:'11',Meta:'∞','Mistral AI':'M'};
let vendor='全部模型',type='all',query='',shown=12,view='card',sortAsc=false;
const grid=document.querySelector('#modelGrid'),count=document.querySelector('#modelCount'),empty=document.querySelector('#empty'),more=document.querySelector('#loadMore');
function filtered(){return models.filter(m=>(vendor==='全部模型'||m[1]===vendor)&&(type==='all'||m[5]===type)&&m.slice(0,4).join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sortAsc?a[0].localeCompare(b[0]):0)}
function card(m){const hot=['GPT-4.1','Claude Opus 4.1','Gemini 2.5 Pro','DeepSeek-V3'].includes(m[0]);return `<article class="card"><div class="card-top"><div class="vendor"><span class="vendor-icon" style="background:${colors[m[1]]||'#555'}">${initials[m[1]]||m[1][0]}</span><div><div class="vendor-name">${m[1]}</div><h3 class="model-name">${m[0]}</h3></div></div>${hot?'<span class="badge">热门</span>':''}</div><p>${m[3]}</p><div class="card-foot"><div><div class="price-label">起始价格</div><div class="price">${m[4]}</div></div><div class="tags"><span class="tag ${m[5]==='vision'?'green':''}">${m[2]}</span></div></div></article>`}
function render(){const arr=filtered(),visible=arr.slice(0,shown);grid.className='model-grid '+(view==='list'?'list':'');grid.innerHTML=visible.map(card).join('');count.textContent=`共 ${arr.length} 个模型`;empty.hidden=arr.length>0;more.hidden=shown>=arr.length||!arr.length}
function setupCategories(){const vendors=['全部模型',...new Set(models.map(m=>m[1]))];document.querySelector('#categories').innerHTML=vendors.map(x=>`<button class="category ${x===vendor?'active':''}" data-vendor="${x}">${x}</button>`).join('');document.querySelectorAll('.category').forEach(b=>b.onclick=()=>{vendor=b.dataset.vendor;shown=12;setupCategories();render()})}
document.querySelector('#search').addEventListener('input',e=>{query=e.target.value;shown=12;render()});
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{type=b.dataset.type;shown=12;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('selected',x===b));render()});
document.querySelectorAll('.view-toggle').forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('.view-toggle').forEach(x=>x.classList.toggle('active',x===b));render()});
document.querySelector('#sortButton').onclick=()=>{sortAsc=!sortAsc;document.querySelector('#sortButton').innerHTML=sortAsc?'名称排序 <span>↑</span>':'综合排序 <span>⌄</span>';render()};more.onclick=()=>{shown+=6;render()};setupCategories();render();
