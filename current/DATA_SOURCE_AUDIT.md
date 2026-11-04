# 2026-11-04收盘数据覆盖与核算输入

本轮上海生成时间：2026-11-04T18:22:08.411407+08:00。
采集固定股票池5771个标识；最新收盘5572，历史退市未请求189，过期或无近期交易10。
5582份原始行情响应哈希检查零不符。腾讯/新浪抽样108/108根价格与标准化量字段核对通过。与11月3日已发布输入重叠61293根日线无价格/量修订。接口部分响应省略旧日线，使用既存已审计同口径源非破坏性组装，详见LOCAL_HISTORY_ASSEMBLY_AUDIT。
执行面板新增有效日线66857根；真实成交额使用源字段，不以收盘价乘量替代，M1原缺陷诊断除外。旧公司分配条款保留，新增公开源145条记录合并去重，非完整公司行动主表。
价格为未复权执行价、成交量标准化为手、成交额为人民币元；收益经济核算处理已知分配。旧历史调整价用于信号延伸，M1保留其原始缺陷，具体边界见LEGACY_CONTINUATION_AUDIT。
源采集SUMMARY里“raw chart extension only”是采集阶段的原始状态；其后本实验独立补行动、信号、逐笔与现金账户，不回写原始采集证据为已认证回测。
最新同日覆盖不代表历史股票池完整。历史ST、退市、部分公司行动、新上市与实际盘中成交有缺口；抽核不等于全量逐根独立验证。未取得数据不填零。

输入与输出：
- 原始源目录：D:\A股低位放量研究\experiments\20261022_exit_confirmation\data\latest_20261104_qq
- 逐股源覆盖：该目录coverage.csv
- 执行面板逐股覆盖：data/PANEL_COVERAGE.csv
- 重叠审计：reports/INPUT_OVERLAP_AUDIT.json
- 公司行动：data/ACTION_FETCH_AUDIT.json、data/actions_partial.json
- 独立逐笔核验：reports/INDEPENDENT_ACCOUNTING_AUDIT.json
- 现金权益核验：reports/ACCOUNT_IDENTITY_AUDIT.json
