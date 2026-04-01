> 本文档基于[Jobro Agent PRD](https://hcnjgmsa8de1.feishu.cn/wiki/YahGwVc15iE8M3kEEUQcRuBrnje)进行修改并结合中国大陆市场衍生[05_Search_Queries_and_Research_Assignment_v1](/05_Search_Queries_and_Research_Assignment_v1.md)

# 提交物 05：检索式与调研分工表 V1 (Search Queries & Research Assignment v1)

**课程名称：** 硬科技创新创业 (Hard Tech Innovation & Entrepreneurship)  
**项目方向：** 面向香港求职市场的 AI 驱动岗位匹配与职业助手平台（Jobro HK）  
**小组成员：** 孙天一、金俊翔、李墨轩  
**日期：** 2026-04-01  
**文档版本：** V1.0

---

## 一、本次调研目标

围绕 `Jobro HK` 的产品设想，本次调研的核心目标是：

1. 明确香港学生与应届生求职场景中的**真实痛点与信息分发链路**，验证“多平台分散、错过短窗口机会、岗位匹配质量低”是否足够高频且强烈。
2. 明确 Jobro MVP 所依赖的**数据来源、合规边界与冷启动方式**，重点判断公开招聘信息抓取、邮箱通知、简历解析和手工导入岗位是否可行。
3. 明确首版产品可采用的**技术路线**，验证简历解析、岗位标签化、AI 匹配排序、聊天式偏好更新和事件埋点的实现难度。
4. 初步了解香港本地及跨境求职领域的**现有平台与替代方案**，避免 Jobro 与传统招聘网站或泛求职社区完全同质化。
5. 通过检索式与任务分工，为下一阶段的用户调研、竞品分析、技术方案设计和 MVP 边界收敛建立统一入口。

本版资料优先使用**香港政府/官方机构页面、官方产品页、官方文档、原始技术资料**，尽量减少二手解读带来的偏差。

---

## 二、检索式设计 V1

| 检索方向 | 检索式 | 检索目的 | 优先级 |
| :--- | :--- | :--- | :--- |
| 香港青年就业现状 | `site:censtatd.gov.hk Hong Kong youth employment graduates statistics` | 判断香港学生和毕业生就业市场规模、失业率与岗位结构 | P0 |
| 香港官方求职服务 | `site:jobs.gov.hk Hong Kong graduate internship jobs official` | 了解官方招聘服务的岗位覆盖与信息组织方式 | P0 |
| 香港输入人才政策 | `site:immd.gov.hk IANG Hong Kong graduates employment visa` | 核验非本地学生或海归在港就业的签证与身份边界 | P0 |
| 香港求职痛点 | `Hong Kong students job search pain points JobsDB LinkedIn WeChat forum` | 验证用户是否长期面临信息碎片化与错失岗位的问题 | P0 |
| 香港大学职业中心 | `HKU careers HKUST careers CUHK careers internship portal` | 判断大学职业门户是否是高质量岗位来源与冷启动渠道 | P0 |
| 招聘平台竞品 | `JobsDB CTgoodjobs LinkedIn Jobs Hong Kong graduates internship` | 梳理现有主流招聘平台对学生/应届生的覆盖情况 | P1 |
| 垂直岗位平台 | `eFinancialCareers Hong Kong analyst internship graduate jobs` | 判断垂直高价值岗位平台能否成为差异化数据源 | P1 |
| 公开岗位抓取合规 | `job board terms of use scraping public jobs compliance` | 判断公开岗位页面抓取和再分发的风险边界 | P0 |
| 简历解析技术 | `resume parser CV parsing PDF extraction open source official` | 评估简历结构化解析的可行工具和实现成本 | P1 |
| 岗位匹配与排序 | `job matching recommendation system candidate job ranking paper` | 调研候选人与岗位匹配的建模方法和评估指标 | P1 |
| 聊天式偏好更新 | `conversational preference learning recommender system LLM` | 验证通过聊天持续更新用户画像的实现思路 | P1 |
| 邮件触达与增长 | `email notification activation retention job alert product benchmark` | 了解邮件提醒在招聘产品中的激活与留存作用 | P1 |
| 产品埋点与漏斗 | `Mixpanel activation retention conversion metrics marketplace` | 为 Jobro 的 MVP success metrics 设计埋点框架 | P1 |
| 香港学生冷启动渠道 | `Hong Kong university forum tree hole WeChat student community recruitment` | 评估 beta 测试用户获取路径与社群扩散方式 | P1 |

---

## 三、资料条目清单（初版不少于 10 条）

### 1. 市场、政策与用户场景类

| 编号 | 资料名称 | 类型 | 主要用途 | 来源链接 |
| :--- | :--- | :--- | :--- | :--- |
| M1 | Hong Kong Census and Statistics Department | 官方统计 | 获取香港劳动力、青年就业、毕业生相关宏观数据，支持市场规模判断 | [C&SD](https://www.censtatd.gov.hk/) |
| M2 | Hong Kong Labour Department Interactive Employment Service | 官方平台 | 了解香港官方招聘信息的组织方式、岗位分类和求职服务结构 | [Jobs.gov.hk](https://www.jobs.gov.hk/) |
| M3 | Hong Kong Immigration Department - IANG / Employment Visas | 官方政策页面 | 判断非本地毕业生、海归或海外学生在港就业的身份与签证要求 | [ImmD](https://www.immd.gov.hk/) |
| M4 | Invest Hong Kong / Talent Related Resources | 官方机构页面 | 了解香港吸引人才、就业机会和国际化人才环境的官方表述 | [InvestHK](https://www.investhk.gov.hk/) |
| M5 | HKU Careers / HKUST Career Center / CUHK Career Planning 等大学职业中心 | 官方校园渠道 | 判断高校职业中心是否可作为高质量岗位来源与用户获取渠道 | [HKU Careers](https://www.cedars.hku.hk/careers/) |

### 2. 竞品、渠道与岗位来源类

| 编号 | 资料名称 | 类型 | 主要用途 | 来源链接 |
| :--- | :--- | :--- | :--- | :--- |
| C1 | JobsDB Hong Kong | 官方产品页 | 观察香港主流招聘平台的岗位密度、筛选逻辑与订阅提醒机制 | [JobsDB](https://hk.jobsdb.com/) |
| C2 | CTgoodjobs | 官方产品页 | 观察本地招聘平台在校园招聘、内容分发和岗位推荐上的做法 | [CTgoodjobs](https://www.ctgoodjobs.hk/) |
| C3 | LinkedIn Jobs | 官方产品页 | 观察职业身份、社交关系和岗位推荐结合的产品路径 | [LinkedIn Jobs](https://www.linkedin.com/jobs/) |
| C4 | eFinancialCareers Hong Kong | 官方产品页 | 观察金融类高价值岗位平台的垂直场景价值和岗位质量 | [eFinancialCareers](https://www.efinancialcareers.hk/) |
| C5 | 公司 Career Pages（如金融、咨询、科技、初创企业官网） | 公开岗位来源 | 评估“高质量但低规模”的公司官网岗位源是否值得优先抓取 | [Google Careers](https://careers.google.com/) |
| C6 | 微信群、树洞、小红书、校友群等手工来源 | 非结构化渠道 | 评估高信号、短窗口岗位如何通过 Excel 或人工整理进入数据库 | 无固定链接 |

### 3. 技术实现与增长验证类

| 编号 | 资料名称 | 类型 | 主要用途 | 来源链接 |
| :--- | :--- | :--- | :--- | :--- |
| T1 | PaddleOCR 官方仓库 | 官方工具文档 | 用于评估 PDF 简历、图片简历和岗位截图的文本抽取能力 | [GitHub](https://github.com/PaddlePaddle/PaddleOCR) |
| T2 | pgvector | 官方开源项目 | 用于评估岗位与用户画像向量召回、相似度检索与排序的实现方案 | [GitHub](https://github.com/pgvector/pgvector) |
| T3 | Mixpanel Docs | 官方文档 | 用于设计激活、留存、点击、付费转化等核心埋点体系 | [Mixpanel](https://docs.mixpanel.com/) |
| T4 | Postmark / SendGrid Docs | 官方文档 | 用于验证 Jobro 的邮件通知、模板管理与送达追踪能力 | [Postmark](https://postmarkapp.com/) |
| T5 | OpenAI Platform Docs | 官方文档 | 用于评估简历理解、岗位摘要、匹配理由生成和聊天偏好更新能力 | [OpenAI Docs](https://platform.openai.com/docs) |

目前共形成 **15 条初步检索入口**。其中市场与政策类适合优先精读，竞品与渠道类适合做对比矩阵，技术类适合支持 MVP 路线选择。

---

## 四、调研分工表 V1

| 成员 | 负责板块 | 具体任务 | 预期交付物 | 建议完成时间 |
| :--- | :--- | :--- | :--- | :--- |
| 孙天一 | 用户场景与冷启动调研 | 梳理香港学生/应届生的主要求职路径、典型痛点、常用信息渠道；调研高校职业中心、树洞、微信群等潜在 beta 招募入口 | 用户痛点清单、渠道地图、首批 beta 用户获取建议 | 2026-04-03 |
| 金俊翔 | 竞品与商业模式调研 | 对比 JobsDB、CTgoodjobs、LinkedIn Jobs、eFinancialCareers 等平台的核心功能、用户定位、提醒机制与差异点；整理 Jobro 的差异化机会 | 竞品对比表、差异化机会点列表、收费与 referral 参考 | 2026-04-04 |
| 李墨轩 | 技术路线与数据方案验证 | 调研简历解析、岗位入库、标签体系、匹配排序、聊天更新偏好、埋点与邮件推送的技术实现路径 | 技术选型表、系统流程草图、MVP 技术风险说明 | 2026-04-04 |
| 全员 | 交叉复核与 MVP 收敛 | 共同确认首批目标用户、首批岗位来源、首版核心功能与 success metrics | 统一版调研纪要、MVP 边界说明、下一阶段任务表 | 2026-04-05 |

---

## 五、3 条待核验问题

### 1. MVP 首批应优先服务哪一类用户？

当前候选人群包括香港本地大学生、在港读书的内地学生、海外留学生回港求职者，以及已经毕业但仍处于早期职业探索阶段的人群。不同人群的岗位来源、签证约束、信息渠道与付费意愿差异较大，需要尽快收敛首批目标用户。

### 2. 岗位数据源应以“公开抓取”为主，还是“手工高质量导入”为主？

Jobro 的核心价值之一在于聚合高信号岗位，但公开招聘网站、公司 career page、微信群和校友群各自的质量、稳定性与合规风险不同。需要核验首版数据库究竟应以自动采集为主，还是以人工整理的高质量岗位为主。

### 3. 首版匹配效果应主要依赖哪些输入信号？

当前设想是“CV + 基础偏好表单 + 聊天反馈”共同驱动匹配，但仍需核验：仅依赖这些输入，是否足以达到较高的岗位相关性；以及用户是否真的愿意持续通过对话修正偏好，而不是只使用静态筛选器。

---

## 六、下一步建议

1. 先完成 **用户场景、竞品格局、数据来源、技术路线** 四条主线的第一轮精读与摘要，不急于一次性扩展过多材料。
2. 优先确定 **首批目标用户 + 首批岗位来源 + 首批核心指标**，避免在 MVP 阶段把范围做得过大。
3. 第一阶段重点验证 Jobro 的三个核心假设：
   `用户是否真的痛于信息碎片化`、`我们是否能稳定拿到高质量岗位`、`AI 匹配是否显著优于传统筛选`
4. 后续文档建议直接围绕 `Jobro.md` 的 MVP 版本推进，并将 success metrics 先对齐到以下指标：
   `Activation > 70%`、`WAU > 40%`、`Match Acceptance > 15%`、`Week-4 Retention > 30%`、`Free → Paid Conversion > 20%`

本版文档的作用，是为 Jobro 项目进入正式调研阶段提供统一的检索入口、资料池和分工基础。后续可继续迭代为 V1.1、V2.0，并逐步补充用户访谈记录、竞品矩阵、技术方案草图和 MVP 需求清单。
