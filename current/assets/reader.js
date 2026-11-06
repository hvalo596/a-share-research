/* Shared reader enhancements. No strategy signals or frozen returns are changed. */
const RD=window.READER_DATA;
function readerFee(value,date){return Math.max(5,value*.00025)+value*(date<'2022-04-29'?.00002:.00001)+value*(date<'2023-08-28'?.001:.0005)}
function readerPeaks(r,p){
 if(!filled(r))return null;
 const e=CAT.dates.indexOf(v(r,'entry_date')),q=+v(r,'quantity'),spent=+v(r,'spent_yuan'),cut=CAT.dates.indexOf(activeCutoff());
 if(e<0||!q||!spent||!p)return null;
 const by=new Map(p.bars.map(b=>[b[0],b])),acts=RD.actions[v(r,'symbol')]||{},values=[];let units=1,cash=0,bad=false,bonus=false;
 for(let t=e;t<=cut;t++){
  const date=CAT.dates[t],x=acts[date],b=by.get(t);
  if(x&&x.record_date>=CAT.dates[e]&&date>CAT.dates[e]){cash+=units*x.cash_per_share_gross*.8;units*=1+x.bonus_per_share;bad||=!!x.reference_unresolved;bonus||=x.bonus_per_share!==0}
  if(b&&b[7]&&!x)bad=true;
  if(t<=e)continue;
  const valid=b&&Number.isFinite(b[4])&&b[4]>0&&b[5]>0;
  if(!valid){values.push({t,bad,bonus,missing:true});continue}
  const sale=q*units*b[4]*.999,net=sale+q*cash-readerFee(sale,date),ret=(net/spent-1)*100;
  let prev=by.get(t-1),ref=prev&&prev[4],sellable=!!(ref>0);
  if(x){if(x.reference_unresolved)sellable=false;ref=(ref-x.reference_cash_per_share)/(1+(x.reference_bonus_per_share??x.bonus_per_share))}
  if(b[7]&&!x)sellable=false;
  if(!(ref>0)||b[4]<=Math.round(ref*.95*100)/100+.011)sellable=false;
  values.push({t,ret,net,raw:b[4],units,cash,bad,bonus,sellable,missing:false})
 }
 return [2,3,5,null].map(n=>{
  const end=n===null?cut:Math.min(cut,e+n),z=values.filter(x=>x.t<=end),ok=z.filter(x=>!x.missing),sell=ok.filter(x=>x.sellable&&!x.bad&&!x.bonus),best=ok.reduce((a,b)=>!a||b.ret>a.ret?b:a,null),feasible=sell.reduce((a,b)=>!a||b.ret>a.ret?b:a,null);
  return {n,end,mature:n===null||cut>=e+n,expected:Math.max(0,end-e),observed:ok.length,missing:z.some(x=>x.missing),bad:z.some(x=>x.bad),bonus:z.some(x=>x.bonus),best,feasible,e}
 })
}
function renderEnhancements(r){
 let box=document.getElementById('holdPeaks');if(!box){box=document.createElement('section');box.id='holdPeaks';const anchor=document.querySelector('#detail .detailnote');anchor?.insertAdjacentElement('afterend',box)}
 if(!box)return;const peaks=readerPeaks(r,S.price);
 if(!peaks){box.innerHTML='<h3>持有不动 · 事后最高收盘净收益</h3><p class="muted">'+(filled(r)?'该股票冻结档案缺少可用报价，不能计算最高收益。':'未实际买入的记录不计算最高收益。')+'</p>';return}
 box.innerHTML='<h3>持有不动 · 事后最高收盘净收益</h3><div class="peakgrid">'+peaks.map(x=>{
 const b=x.best,title=x.n===null?'持有至数据截止':`买入后${x.n}个交易日内`;
 return `<div><span>${title}${!x.mature?' · 未满窗口':''}</span><strong class="${b?cls(b.ret):''}">${b?pct(b.ret):'暂无可观察收盘'}</strong><small>${b?`峰值 ${CAT.dates[b.t]} · 买入后第${b.t-x.e}个交易日`:'T+1起才进入统计'}</small><small>${b?`当日原始收盘 ${num(b.raw,4)}元；假设净盈亏 ${money(b.net-v(r,'spent_yuan'))}元`:''}</small><small>报价 ${x.observed}/${x.expected}日${x.missing?' · 有缺口':''}${x.bad?' · 公司行动未决，仅作参考':''}${x.bonus?' · 送转可交易日未核':''}</small><small>通过保守卖出代理的峰值：${x.feasible?pct(x.feasible.ret)+'（'+CAT.dates[x.feasible.t]+'）':'无可核实观察'}</small></div>`
 }).join('')+'</div><details><summary>统计口径</summary><p>2/3/5日不含买入日，以交易所交易日计；窗口内从T+1起选最高收盘，不是第N天的收益。最后一档只到该模型真实截止（'+activeCutoff()+'），不是股票一生的最高价。即使最高值仍为负，也如实展示。</p><p>同一实际买价、股数及含费成本；假设卖出滑点0.1%、最低佣金5元、历史印花税/过户费；已知送转与20%税后红利应收纳入经济价值。未决公司行动、未知送股上市日、停牌和跌停代理有局限。可售代理仅是保守日线检查，不能保证成交。</p><p>这些是事后路径诊断，没有用于原买卖规则，也不加入策略实际盈利。不同买点观察长度不同；未满窗口与缺数据都不能当成完整样本。</p></details>';
}
function readerMonthTable(rows,calendar=false){return '<div class="tablewrap"><table><thead><tr><th>月份</th><th>'+ (calendar?'自然月估值增量':'该月买点最终/截止盈亏')+'</th><th>该月计划预算</th><th>该月实际投入</th><th>'+(calendar?'收益率':'盈亏 / 计划预算')+'</th><th>'+(calendar?'估值缺口 / 行动未决':'已买笔数')+'</th></tr></thead><tbody>'+rows.map(x=>`<tr><td>${x.month}</td><td class="${cls(calendar?x.pnl:x.cohort_pnl)}">${money(calendar?x.pnl:x.cohort_pnl)}元</td><td>${money(x.budget)}</td><td>${money(x.spent)}</td><td>${calendar?'—':pct(x.budget?x.cohort_pnl/x.budget*100:null)}</td><td>${calendar?x.mark_missing+' / '+x.action_unresolved:x.fills}</td></tr>`).join('')+'</tbody></table></div>'}
function renderMonthly(){
 const box=$('monthly');if(!box||!RD)return;
 let groups={};for(const r of S.filtered){const d=v(r,'entry_date'),m=d?.slice(0,7);if(!m)continue;let x=groups[m]||(groups[m]={month:m,budget:0,spent:0,cohort_pnl:0,fills:0});if(v(r,'status')!=='future_session_pending')x.budget+=+v(r,'allocation_yuan')||0;if(filled(r)){x.spent+=+v(r,'spent_yuan')||0;x.cohort_pnl+=+v(r,'pnl_yuan')||0;x.fills++}}
 const rows=Object.values(groups).sort((a,b)=>a.month.localeCompare(b.month));if(isOV()){for(const x of rows)x.budget=new Set(S.filtered.filter(r=>v(r,'entry_date')?.startsWith(x.month)&&v(r,'status')!=='future_session_pending').map(r=>v(r,'entry_date'))).size*10000}
 let html='<h3>按买入月份分组 · 当前筛选</h3><p class="muted">这是该月买入批次后来赚亏多少，含截止持仓估值；不代表这些利润都发生在买入当月。分母是该月计划预算，未成交和一手不足的空置仍计预算。</p>'+readerMonthTable(rows);
 const key=[$('model').value,$('exit').value,$('k').value].join('|'),full=mode()==='topk'&&$('sizing').value==='integer_lots'&&!isOV()?RD.monthly[key]:null;
 if(full){const total=full.reduce((a,b)=>a+b.pnl,0);html+='<details><summary>按自然月分摊的估值盈亏 · 完整所选情景</summary><p>当前模型、退出及前'+$('k').value+'只的完整历史口径，独立于股票/年份/成熟度筛选。月末按假设净清算价值估值，实际退出采用原账本终值；上月末到本月末的增量扣除本月注资。月度增量合计 '+money(total)+'元，与该完整情景原逐笔净盈亏对账。</p><p>这是持续每日投入情景的月度盈亏金额；没有把当月投入当月初本金，也不伪造复利月收益率。若需要资金收益率，应另建真实注资时序的TWR或MWR。应收红利、送转及缺报价仍受原数据局限约束。</p>'+readerMonthTable(full,true)+'</details>'}
 else html+='<p class="muted">自然月估值表仅新增于M1/M3/B1整手前2/前4情景；全信号、初始现金账户与暂停的超跌暂未补算，不用其他口径代替。</p>';
 box.innerHTML=html;
}
function renderNewFundamentals(r){
 const date=v(r,'entry_date');if(!date||date<'2026-09-01')return false;
 const box=$('fundamentals'),z=RD.fundamentals[v(r,'symbol')+'|'+date];if(!box)return false;
 if(!z){box.innerHTML='<h3>买点基本面与独立估值</h3><p>本买点未完成资料核验；不将之后的报告或今日信息回填到买入时。</p>';return true}
 let f=z.financial,html=`<h3>买点基本面与独立估值</h3><p><strong>${esc(z.industry||'行业待核')} · 信息冻结于买入前</strong></p>`;
 html+=`<p>${z.business?esc(z.business):'已补当时可用财报快照；尚未逐家核实商业模式、客户和行业生态，不能称完成公司研究。'}</p>`;
 if(z.ecosystem)html+='<p><strong>生意生态：</strong>'+esc(z.ecosystem)+'</p>';
 for(const [key,label] of [['transformation','转型与增长'],['plans','重大计划'],['rank_status','行业位置'],['falsifier','关键反证']])if(z[key])html+=`<p><strong>${label}：</strong>${esc(z[key])}</p>`;
 if(z.peers?.length)html+='<p><strong>可比对象：</strong>'+esc(z.peers.join('、'))+'。'+esc(z.peer_note)+'</p>';
 if(f)html+=`<details><summary>买入前可用财报快照 · ${esc(f.REPORTDATE?.slice(0,10))}</summary><p>披露 ${esc(f.NOTICE_DATE?.slice(0,10))}，严格早于 ${date}；收入 ${num(f.TOTAL_OPERATE_INCOME==null?null:f.TOTAL_OPERATE_INCOME/1e8)}亿元；归母 ${num(f.PARENT_NETPROFIT==null?null:f.PARENT_NETPROFIT/1e8)}亿元；EPS ${num(f.BASIC_EPS,4)}；每股净资产 ${num(f.BPS,4)}元；ROE ${num(f.WEIGHTAVG_ROE)}%。买价/每股净资产 ${num(z.entry_pb)}倍（会计比率，不是内在价值）。供应商可能后续重述，点时数据版本未认证。</p></details>`;
 if(z.valuation){const val=z.valuation;html+=`<details open><summary>自主估值 · 研究假设，尚未达到交易决策标准</summary><p>${esc(val.method)}</p><div class="tablewrap"><table class="valuation-table"><thead><tr><th>情景</th><th>正常化年度股东收益</th><th>5年增长 / 折现 / 永续增长</th><th>今日估计价值/股</th><th>第5年剩余生意价值/股</th></tr></thead><tbody>${val.scenarios.map(x=>`<tr><td>${esc(x.name)}</td><td>${num(x.normalized_owner_earnings_yuan/1e8)}亿元</td><td>${num(x.growth_5y*100)}% / ${num(x.discount*100)}% / ${num(x.terminal_growth*100)}%</td><td>${num(x.present_value_per_share)}元</td><td>${num(x.year5_terminal_value_per_share)}元</td></tr>`).join('')}</tbody></table></div><p>${esc(val.assumptions)}</p><p>${esc(val.caveat)}</p></details>`}
 else html+='<p><strong>自主估值：未完成。</strong>尚无经商业模式、行业供需和再投资需求支撑的未来可分配收益假设，暂不给出精确价值或短期目标价；不照搬券商目标价，也不将半年EPS机械翻倍。</p>';
 html+='<details><summary>证据与覆盖范围</summary>'+z.sources.map(s=>`<p>${esc(s.title)} · 披露 ${esc(s.published)}${s.pages?' · 读页 '+esc(s.pages):''}${s.url?` · <a href="${esc(s.url)}" target="_blank" rel="noopener">原披露文件</a>`:''}</p>`).join('')+`<p>近期覆盖 ${RD.fundamental_coverage.companies}家公司、${RD.fundamental_coverage.entry_cards}个不同买点；其中仅${RD.fundamental_coverage.primary_business_cards}个买点具备新增原文商业分析与示例估值，其余为数据快照或缺证标记。完整尽调与可用估值仍未完成。</p></details>`;
 box.innerHTML=html;return true;
}
