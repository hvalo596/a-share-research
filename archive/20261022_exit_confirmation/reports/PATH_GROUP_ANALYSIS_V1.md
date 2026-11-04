# 退出路径分组诊断 V1

生成于2026-10-22。使用已完成 F60 样本做事后路径诊断，并把每个新规则和同一买点的 F60 结果配对。最高收盘 MFE 只说明“曾经到过”，不是可实现成交价。

## 诊断分组

- F60逐笔样本：72,046 条。
- “早期明显盈利、后来回撤”：13,457 条；定义为 MFE≥15%、F60最终经济收盘收益<5%、MFE与最终收益差≥10个百分点。
- F60最终亏损但曾有至少10% MFE：16,180 条。
- F60亏损样本中，曾有 MFE≥5% / ≥10% / ≥15% 的数量：26,409 / 16,180 / 9,644。

这些数字只能说明“事后曾经有机会”，不能证明当时能准确卖出；它们的意义是判断固定60日退出是否可能错过了可研究的风险控制窗口。

## 新退出与 F60 的同买点配对

|执行敏感性|规则|路径组|样本|F60收益中位数|新规则收益中位数|收益差中位数|平均损益差|正差占比|新规则持有中位数|
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
|legacy_5pct_proxy|P15_MA20|early_profit_late_fade|6728|-5.18%|1.63%|3.99%|276.25|59.68%|41.00|
|legacy_5pct_proxy|P15_MA20|profitable_peak_but_f60_loss|8090|-9.18%|-4.93%|0.00%|198.36|36.48%|60.00|
|legacy_5pct_proxy|P15_MA20|never_10pct_peak|14908|-11.75%|-11.75%|0.00%|0.00|0.00%|60.00|
|legacy_5pct_proxy|P15_MA20_RS|early_profit_late_fade|6728|-5.18%|-0.18%|1.66%|216.68|54.03%|45.00|
|legacy_5pct_proxy|P15_MA20_RS|profitable_peak_but_f60_loss|8090|-9.18%|-5.89%|0.00%|157.63|33.78%|60.00|
|legacy_5pct_proxy|P15_MA20_RS|never_10pct_peak|14908|-11.75%|-11.75%|0.00%|0.00|0.00%|60.00|
|legacy_5pct_proxy|P15_MA20_SLOPE|early_profit_late_fade|6728|-5.18%|-0.94%|0.68%|186.11|51.07%|47.00|
|legacy_5pct_proxy|P15_MA20_SLOPE|profitable_peak_but_f60_loss|8090|-9.18%|-6.38%|0.00%|138.30|32.14%|60.00|
|legacy_5pct_proxy|P15_MA20_SLOPE|never_10pct_peak|14908|-11.75%|-11.75%|0.00%|0.00|0.00%|60.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20|early_profit_late_fade|6729|-5.20%|1.54%|4.02%|273.00|59.73%|40.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20|profitable_peak_but_f60_loss|8090|-9.12%|-5.00%|0.00%|195.26|36.48%|60.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20|never_10pct_peak|14908|-11.75%|-11.75%|0.00%|0.00|0.00%|60.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20_RS|early_profit_late_fade|6729|-5.20%|-0.18%|1.69%|215.30|54.23%|44.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20_RS|profitable_peak_but_f60_loss|8090|-9.12%|-5.89%|0.00%|156.18|33.92%|60.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20_RS|never_10pct_peak|14908|-11.75%|-11.75%|0.00%|0.00|0.00%|60.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20_SLOPE|early_profit_late_fade|6729|-5.20%|-0.92%|0.78%|184.64|51.29%|47.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20_SLOPE|profitable_peak_but_f60_loss|8090|-9.12%|-6.41%|0.00%|135.88|32.26%|60.00|
|ordinary_mainboard_10pct_sensitivity|P15_MA20_SLOPE|never_10pct_peak|14908|-11.75%|-11.75%|0.00%|0.00|0.00%|60.00|

## 如何读这些结果

- 若新规则在“早期盈利后回撤”组中多数正差，说明它可能减少后半段回撤；还要检查是否把趋势大赢家提前卖掉。
- 若在“最终亏损但曾有MFE”的组中仍没有稳定正差，说明只设盈利峰值触发并不足够，可能需要结合市场/行业相对弱势，而不是继续堆阈值。
- F60亏损中曾有MFE的比例不能被称为回本概率，因为卖点仍未知，且路径只在已完成历史样本中观察。

## 下一步

下一步只保留一个有明确机制的候选：盈利后若个股相对沪深300持续走弱且价格跌破趋势线，下一开盘退出；其余规则继续作为对照。先做后续未观察交易日的锁定验证，再决定是否加入网页主面板。
