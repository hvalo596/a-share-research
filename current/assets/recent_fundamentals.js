/* Recent signal companies: evidence/assumptions separated; never changes model signals. */
(function(){
 const data=window.RECENT_COMPANIES;if(!data)return;
 const e=x=>String(x??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=(x,d=2)=>x==null||!Number.isFinite(+x)?'未核':Number(x).toLocaleString('zh-CN',{minimumFractionDigits:d,maximumFractionDigits:d});
 const p=x=>n(x*100)+'%';const yi=x=>n(x/1e8)+'亿元';
 window.renderRecentCompany=function(symbol){
  const c=data.companies[symbol];if(!c)return null;
  const f=c.financial,v=c.valuation,vs=v.scenarios||[],base=vs[1];
  let h=`<article class="recent-company" data-company="${e(symbol)}"><header><span class="rf-tag">${e(c.industry)}</span><h3>${e(c.name)} <small>${e(symbol)}</small></h3><p class="rf-sub">${e(c.models.join(' / '))} · 信号 ${e(c.signal_dates.join('、'))} · 研究补注 2026-11-06</p></header>`;
  h+=`<div class="rf-metrics"><div><small>参照收盘 · ${e(c.reference_date)}</small><b>${n(c.reference_close)}元</b></div><div><small>以三季股本估算市值</small><b>${yi(c.reference_close*f.shares)}</b></div><div><small>前三季归母</small><b>${yi(f.values.profit)}</b></div><div><small>前三季扣非</small><b>${yi(f.values.recurring)}</b></div></div>`;
  h+=`<h4>这门生意如何赚钱</h4><p>${e(c.business)}</p><p>${e(c.ecosystem)}</p><h4>行业位置与对手</h4><p>${e(c.rank_status)}</p><p><b>业务对照：</b>${e(c.peers.join('、'))}。${e(c.peer_note)}</p><h4>增长要靠什么兑现</h4><p>${e(c.plans)}</p><p class="rf-risk"><b>最强反证：</b>${e(c.falsifier)}</p>`;
  h+='<h4>我们自己的估值</h4>';
  if(v.status==='withheld')h+=`<div class="rf-risk"><b>目前给不了可靠的每股估值</b><p>${e(v.reason)}</p><p>${e(v.needed)}</p></div>`;
  else{
   let lo=Math.min(...vs.map(x=>x.present_value_per_share)),hi=Math.max(...vs.map(x=>x.present_value_per_share));
   h+=`<p><b>初步情景现值（元/股）：${n(lo)}—${n(hi)}元/股；基准 ${n(base.present_value_per_share)}元。</b>参照价格 ${n(c.reference_close)}元（11月5日，不是实时行情）。这是未充分验证的假设区间，目前还不能给出可靠估值或作为买入依据。</p><p>${e(v.rationale)}</p><div class="rf-table"><table><thead><tr><th>情景</th>`;
   h+=v.method==='equity_cash_scenarios'?'<th>正常年归母利润</th><th>可分配比例</th><th>五年增速 / 要求回报 / 永续</th>':'<th>未来5年ROE</th><th>分红率</th><th>要求回报率</th>';
   h+='<th>今日现值/股</th><th>第5年剩余价值/股</th><th>前5年累计分配/股</th></tr></thead><tbody>';
   h+=vs.map(x=>`<tr><td>${e(x.name)}</td>${v.method==='equity_cash_scenarios'?`<td>${yi(x.normal_profit_yuan)}</td><td>${p(x.cash_conversion)}</td><td>${p(x.growth_5y)} / ${p(x.discount)} / ${p(x.terminal_growth)}</td>`:`<td>${p(x.roe)}</td><td>${p(x.payout)}</td><td>${p(x.required_return)}</td>`}<td>${n(x.present_value_per_share)}元</td><td>${n(x.year5_remaining_value_per_share)}元</td><td>${n(x.cash_paid_5years_per_share)}元</td></tr>`).join('')+'</tbody></table></div>';
   if(v.required_normal_profit_at_reference_price_yuan)h+=`<p><b>反过来问：</b>保持基准现金转换、增长及折现不变，要支持参照股价，需要正常年归母利润约${yi(v.required_normal_profit_at_reference_price_yuan)}，而我们基准假设为${yi(base.normal_profit_yuan)}。这是本模型的反推，不代表市场真正在使用这些假设。</p>`;
   h+=`<details><summary>计算方法、敏感性与局限</summary><p>${e(v.formula)}</p><p>${e(v.caveat)}</p>`;
   if(v.sensitivity)h+='<div class="rf-table"><table><tr><th>要求回报率</th><th>可分配比例</th><th>现值/股</th></tr>'+v.sensitivity.map(x=>`<tr><td>${p(x.discount)}</td><td>${p(x.cash_conversion)}</td><td>${n(x.present_value_per_share)}元</td></tr>`).join('')+`</table></div><p>基准终值折现占总估值 ${p(base.terminal_pv_weight)}；该比例高意味着长期假设影响大。增长所需再投资与可分配比例须共同核实，不能同时假设无限增长与把利润全部取走。</p>`;
   h+=`<p>${e(v.short_term_note)}</p></details>`;
  }
  h+=`<details><summary>财务证据 · 2026年前三季累计，不是全年</summary><div class="rf-table"><table><tr><th>营业收入</th><th>归母净利</th><th>扣非净利</th><th>经营现金净额</th><th>归母净资产 · 9月末</th></tr><tr>${['revenue','profit','recurring','operating_cash','book'].map(k=>'<td>'+yi(f.values[k])+'</td>').join('')}</tr></table></div><p>${e(f.audit)}；${e(f.share_basis)}，股本${n(f.shares/1e8,4)}亿股。参照市值不是已核实到11月5日的实时总股本市值；经营现金不等于自由现金，券商现金还含客户资金变化。</p></details>`;
  h+='<details><summary>原始披露与信息边界</summary>'+c.sources.map(s=>`<p><a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.title)}</a> · 披露 ${e(s.published)} · 选读页 ${e(s.pages.join('、'))}<small class="rf-hash">SHA256 ${e(s.sha256)}</small></p>`).join('')+`<p>${e(data.coverage.source_note)} 财报选读不是完整尽调，同行比较不是收益排名；尚未逐家公司核验报告披露后的全部临时公告。本轮不把基本面分数追加入历史回测，不改原选股和退出规则。</p></details></article>`;
  return h;
 };
 window.mountRecentCompanies=function(){
  const root=document.getElementById('recentCompanyResearch');if(!root)return;
  const companies=Object.values(data.companies).sort((a,b)=>b.signal_dates.at(-1).localeCompare(a.signal_dates.at(-1))||a.symbol.localeCompare(b.symbol));
  const select=root.querySelector('[data-rf-select]'),panel=root.querySelector('[data-rf-panel]');
  select.innerHTML=companies.map(c=>`<option value="${e(c.symbol)}">${e(c.name)} · ${e(c.models.join('/'))} · ${e(c.signal_dates.at(-1))}</option>`).join('');
  const choose=s=>{if(!data.companies[s])return;select.value=s;panel.innerHTML=window.renderRecentCompany(s);root.dataset.current=s;};
  select.onchange=()=>choose(select.value);choose(new URLSearchParams(location.search).get('symbol')||companies[0].symbol);
  document.getElementById('srows')?.addEventListener('click',ev=>{const b=ev.target.closest('[data-rf-company]');if(b){choose(b.dataset.rfCompany);root.scrollIntoView({behavior:'smooth',block:'start'});}});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',window.mountRecentCompanies);else window.mountRecentCompanies();
})();
