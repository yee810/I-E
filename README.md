# Jobro — AI 驱动岗位匹配与职业助手平台

> 面向中国大陆校招/实习学生，在多渠道岗位信息碎片化且窗口短的求职场景中，利用「简历解析 + 偏好建模 + 岗位聚合 + 混合匹配 + 可解释推荐 + 提醒闭环」，优先改善「24h 内获得首批可投岗位」与「Match Acceptance」等指标。

## 项目简介

Jobro 是硬科技创新创业课程的小组项目（Course Project），核心定位是「供给之上的匹配与决策层」—— 不解决岗位是否存在的问题，而是帮用户更快发现、更准匹配、更少错过。

当前处于 **TRL 3→4 阶段**：已完成方向收敛、需求文档、前端 Demo 原型，正在推进用户验证与 MVP 主链路打通。

## 仓库导航

```
├── README.md                 # 本文件
├── start.sh                  # 一键启动脚本（前后端同时启动）
├── docs/
│   ├── api.md                # API 接口文档（含管理面板）
│   ├── course_submissions/   # 课程作业（01–08 提交物）
│   ├── prd/                  # PRD 与技术路线
│   └── templates/            # 课程模板/框架文件
├── src/
│   ├── backend/              # Express.js 后端（API + AI 匹配 + 管理面板）
│   └── frontend/             # Web 前端（React + Vite + TailwindCSS）
├── data_samples/             # 脱敏样例数据（严禁放入真实敏感数据）
├── tests/                    # 测试脚本、测试样例、基准结果
├── reports/                  # 周记录、问题清单、迭代计划
└── .gitignore                # 忽略密钥、缓存、真实数据和本地环境文件
```

**⚠️ 敏感数据提醒**：病例、简历、微信截图、聊天记录等敏感信息必须经过脱敏处理后才能放入仓库。原始敏感数据严禁上传至任何公开仓库。

## 快速启动

前置依赖：Node.js ≥ 18

```bash
# 1. 安装依赖
cd src/backend && npm install && cd ../..
cd src/frontend && npm install && cd ../..

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY 等配置

# 3. 一键启动（前后端同时启动）
./start.sh
```

或分别启动：

```bash
# 后端（端口 3001）
cd src/backend && npm run dev

# 前端（端口 3000）
cd src/frontend && npm run dev
```

**默认管理员账号**：`admin@jobro.com` / `admin123`（可在 `.env` 中通过 `ADMIN_EMAIL` / `ADMIN_PASSWORD` 配置）

## 技术栈

- **后端**：Express.js 4 + TypeScript + Better-SQLite3
- **前端**：React 19 + Vite 6 + TailwindCSS 4 + Framer Motion
- **AI**：OpenAI GPT-4o（简历解析 / 匹配重排 / 聊天）+ Gemini（前端辅助）
- **数据层**：Better-SQLite3（本地开发用，后续可迁移）
- **认证**：HMAC-SHA256 时段令牌 + 角色权限（user / admin）
- **国际化**：后端 i18n 翻译系统（中/英双语），`?lang=zh-CN` 切换

## API 概览

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/auth` | 注册、登录 |
| 资料 | `/api/profiles` | 简历上传、资料管理 |
| 偏好 | `/api/preferences` | 求职偏好设置 |
| 职位 | `/api/jobs` | 职位列表、批量导入 |
| 匹配 | `/api/matching` | 推荐与匹配计算 |
| 反馈 | `/api/feedback` | 匹配反馈 |
| 聊天 | `/api/chat` | AI 职业助手 |
| 事件 | `/api/events` | 分析事件追踪 |
| **管理面板** | `/api/admin` | 用户/职位/匹配/分析/系统管理（仅 admin） |

完整接口文档见 [docs/api.md](docs/api.md)。

## 管理面板

管理员通过 `/api/admin/*` 接口管理平台：

- **用户管理**：列表、详情、角色变更、删除
- **职位管理**：CRUD、状态流转（active / paused / closed / archived）
- **匹配管理**：查看、状态变更、批量操作
- **数据分析**：总览统计、注册趋势、行业分布、聊天使用量
- **系统管理**：健康检查、配置管理、操作审计日志

## 国际化（i18n）

后端支持中英双语响应：

- 通过 `?lang=zh-CN` 查询参数切换
- 或通过 `Accept-Language` 请求头
- 错误响应同时返回翻译键（`error`）和翻译文本（`message`），前端可按需使用

翻译文件位于 `src/backend/i18n/locales/`，新增翻译只需编辑 `en.json` 和 `zh-CN.json`。

## 后端脚本

```bash
cd src/backend

npm run dev           # 开发模式（热重载）
npm run start         # 生产模式
npm run db:init       # 初始化数据库 schema
npm run db:seed-admin # 创建/升级管理员账号
```

## 成员分工

| 成员 | 角色 | 当前重点 |
|------|------|----------|
| 孙天一 | 需求验证 | 用户访谈执行、证据整理、渠道与冷启动调研 |
| 金俊翔 | 产品与整合 | 价值主张、竞品矩阵、答辩材料 |
| 李墨轩 | 技术实现 | MVP 主链路开发、岗位库、匹配、埋点 |
| 王锡葵 | 资源整合 | 岗位来源对接、对照调试、外部支持 |

## 演示入口

- **P0 MVP Demo（前端）**：`src/frontend/` — 已覆盖注册→建档→偏好→聊天→推荐→投递 闭环
- **管理面板 API**：`/api/admin/*` — 需 admin 账号登录
- **[📋 week7 周报](reports/week7.md)** — 当前进度、问题、下一步

## 核心指标口径

| 指标 | 目标 | 判据 |
|------|------|------|
| Activation | > 70% | 完成简历+偏好并查看推荐 |
| Match Acceptance | > 15% | 推荐岗位被收藏/点击投递/标记感兴趣 |
| 24h 内首批可投岗位 | < 24h | 用户输入完成后到首次推荐时延 |
| Week-4 Retention | > 30% | 连续观测 |

## 阶段规划记号

- **借用材料**（原始 PRD）：`docs/prd/Jobro.md`
- **衍生产出**：`docs/prd/jobro_prd_standalone_techtree_timeline.md`
- **课程作业 01-08**：`docs/course_submissions/01_*.md` — `08_*.md`

## License

课程作业仓库，仅限学术交流使用。内部 PRD 与原型代码的所有权归小组成员所有。
