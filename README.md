# Jobro — AI 驱动岗位匹配与职业助手平台

> 面向中国大陆校招/实习学生，在多渠道岗位信息碎片化且窗口短的求职场景中，利用「简历解析 + 偏好建模 + 岗位聚合 + 混合匹配 + 可解释推荐 + 提醒闭环」，优先改善「24h 内获得首批可投岗位」与「Match Acceptance」等指标。

## 项目简介

Jobro 是硬科技创新创业课程的小组项目（Course Project），核心定位是「供给之上的匹配与决策层」—— 不解决岗位是否存在的问题，而是帮用户更快发现、更准匹配、更少错过。

当前处于 **TRL 3→4 阶段**：已完成方向收敛、需求文档、前端 Demo 原型，正在推进用户验证与 MVP 主链路打通。

## 仓库导航

```
├── README.md                 # 本文件
├── docs/
│   ├── course_submissions/   # 课程作业（01–08 提交物）
│   ├── prd/                  # PRD 与技术路线
│   └── templates/            # 课程模板/框架文件
├── src/
│   └── frontend/             # Web 前端 Demo（React + Vite + TailwindCSS）
├── data_samples/             # 脱敏样例数据（严禁放入真实敏感数据）
├── tests/                    # 测试脚本、测试样例、基准结果
├── reports/                  # 周记录、问题清单、迭代计划
│   └── week7.md              # 当前周记录（见下方）
└── .gitignore                # 忽略密钥、缓存、真实数据和本地环境文件
```

**⚠️ 敏感数据提醒**：病例、简历、微信截图、聊天记录等敏感信息必须经过脱敏处理后才能放入仓库。原始敏感数据严禁上传至任何公开仓库。

## 运行方式（前端 Demo）

前置依赖：Node.js ≥ 18

```bash
cd src/frontend
npm install
cp .env.example .env.local   # 填入 GEMINI_API_KEY
cd src/frontend && npm run dev
```

默认端口 `3000`：http://localhost:3000

## 成员分工

| 成员 | 角色 | 当前重点 |
|------|------|----------|
| 孙天一 | 需求验证 | 用户访谈执行、证据整理、渠道与冷启动调研 |
| 金俊翔 | 产品与整合 | 价值主张、竞品矩阵、答辩材料 |
| 李墨轩 | 技术实现 | MVP 主链路开发、岗位库、匹配、埋点 |
| 王锡葵 | 资源整合 | 岗位来源对接、对照调试、外部支持 |

## 演示入口

- **P0 MVP Demo（前端）**：`src/frontend/` — 已覆盖注册→建档→偏好→聊天→推荐→投递 闭环
- **[📋 week7 周报](reports/week7.md)** — 当前进度、问题、下一步

## 核心指标口径

| 指标 | 目标 | 判据 |
|------|------|------|
| Activation | > 70% | 完成简历+偏好并查看推荐 |
| Match Acceptance | > 15% | 推荐岗位被收藏/点击投递/标记感兴趣 |
| 24h 内首批可投岗位 | < 24h | 用户输入完成后到首次推荐时延 |
| Week-4 Retention | > 30% | 连续观测 |

## 技术栈

- **前端**：React 19 + Vite 6 + TailwindCSS 4 + Framer Motion（`motion`）
- **AI**：Gemini API（`@google/genai`）
- **数据层**：Better-SQLite3（本地开发用，后续可迁移）
- **状态**：React Context + 本地 state（MVP 阶段）

## 阶段规划记号

- **借用材料**（原始 PRD）：`docs/prd/Jobro.md`
- **衍生产出**：`docs/prd/jobro_prd_standalone_techtree_timeline.md`
- **课程作业 01-08**：`docs/course_submissions/01_*.md` — `08_*.md`

## License

课程作业仓库，仅限学术交流使用。内部 PRD 与原型代码的所有权归小组成员所有。
