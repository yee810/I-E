- Jobro HK Agentic System
  @notes:
    - 基于 Jobro PRD 的独立产品开发路线整理，不与课程节次绑定
    - 结构按 Phase → Week / Capability → Task 组织，适合导入科技树时间图
    - 未写绝对日期，保留 PRD 原有 Week / Month 时间锚点，导入后可再映射真实时间
  - Phase 1｜P0 MVP（Text-First Matching Platform，4 weeks）
    @notes:
      - 目标：先验证“文本优先岗位匹配平台”是否成立
      - 核心闭环：注册建档 → 偏好输入 → 岗位入库 → AI 匹配 → Web/Email 推送 → 反馈学习 → 付费/推荐 → 指标追踪
      - 核心功能范围：F1-F7
    - Week 1｜Foundation / Onboarding / Data Base
      @notes:
        - PRD里程碑：Repo、CI/CD、DB schema、email auth（Cognito）、landing page、CV upload + parsing、event tracking base
        - 目标：把“用户进入系统并完成初始建档”的基础链路搭起来
      - Repo 与工程底座
        @notes:
          - 建立代码仓库、分支规范、基础 CI/CD
          - 明确前后端与数据层目录结构
      - 数据库 Schema
        @notes:
          - 建 users、profiles、jobs、events 等核心表
          - 先冻结 CandidateProfile / JobPosting / Event 三类字段
      - Email 注册与认证
        @notes:
          - 使用 Amazon Cognito
          - MVP 仅支持 email sign-up / login
      - Landing Page
        @notes:
          - 首屏价值表达：停止刷新多个平台，让 AI 帮你找机会
      - CV Upload
        @notes:
          - 支持 PDF 上传
          - 接入 CV parsing，输出结构化候选人字段
      - Event Tracking Base
        @notes:
          - 先打通 sign-up、CV upload、session start 等最小埋点
    - Week 2｜Preferences / Job Database / JD Structuring
      @notes:
        - PRD里程碑：Preferences form、job database（priority sources scraping pipeline）、JD parsing、embedding / ranking preparation
        - 目标：把“岗位供给侧”和“用户偏好侧”都结构化
      - Preferences Form
        @notes:
          - 采集 target roles、availability、duration、salary expectation、industry / company size / location 等
      - Job Database Pipeline
        @notes:
          - 优先接入高优先级香港岗位源
          - 同步保留 Excel upload 入口给人工/非正式渠道
      - JD Parsing
        @notes:
          - 将职位描述转成结构化字段
          - 打标签：industry、role type、seniority、deadline、source
      - Job Dedup / Tagging
        @notes:
          - 做岗位去重、标准化和标签规则
      - Matching Data Preparation
        @notes:
          - 为匹配引擎准备向量化 / embedding / ranking 所需数据
          - 让用户画像与岗位画像进入同一可计算空间
    - Week 3｜Matching / Feed / Feedback / Notification
      @notes:
        - PRD里程碑：Matching engine（LLM-powered）+ match feed UI（apply / not interested）+ email notification
        - 目标：让用户第一次看到“可操作的匹配结果”
      - LLM-powered Matching Engine
        @notes:
          - 基于 stated preferences + CV signals 做首轮岗位匹配
          - 输出排序结果与 personalized rationale
      - Match Feed UI
        @notes:
          - Web 端展示 ranked job cards
          - 岗位卡包含 company、role、location、requirements、salary、deadline、rationale
      - Apply / Not Interested Feedback
        @notes:
          - 用户可跳转原申请网站
          - 用户可标记 not interested，作为负反馈信号
      - Email Notification
        @notes:
          - 发送 condensed JD summary
          - 邮件链接回到 Web 端完整 JD
      - Preference Refinement via Text Chat
        @notes:
          - 用户通过文本聊天持续修正偏好
          - 聊天结果回写用户偏好模型
      - Tracking Expansion
        @notes:
          - 增加 match viewed、apply click、match rejected、chat message、email open、email click 等事件
    - Week 4｜Monetization / Referral / QA / Soft Launch
      @notes:
        - PRD里程碑：Pricing / paywall（10 free pushes + ¥9.99/month）+ referral system + E2E testing + soft launch
        - 目标：把 MVP 从“能跑”推进到“可试运营”
      - Pricing / Paywall
        @notes:
          - 10 次免费推送
          - 之后 ¥9.99 / month 订阅
      - Referral System
        @notes:
          - referrer 与 referee 各得 1 个月免费时长
      - E2E Testing
        @notes:
          - 端到端测试注册、上传、偏好、匹配、反馈、通知、转化链路
      - Analytics Check
        @notes:
          - 检查 Activation、WAU、Match Acceptance、Retention、Conversion 所需事件是否可算
      - Soft Launch
        @notes:
          - 面向 beta testers 小规模上线
          - 目标用户先聚焦香港求职学生/毕业生
    - P0 功能树（F1-F7）
      @notes:
        - 这是 Phase 1 的能力拆解树，可与 Week 1-4 同时作为导入结构使用
      - F1｜User Sign-Up + Profile Intake
        @notes:
          - Email sign-up
          - CV upload（PDF）
          - 可选 LinkedIn / website / portfolio / files
          - CV parsing 预填 CandidateProfile
      - F2｜Basic Preferences Form
        @notes:
          - Target roles
          - Availability / duration
          - Salary expectation（optional）
          - Industry / company size / location filters
      - F3｜AI Job Matching + Notifications
        @notes:
          - 首次登录后立即匹配
          - Web 端岗位卡 + in-app notification
          - Email condensed summary
          - Free tier 前 10 次推送
      - F4｜Text Chat with AI Agent
        @notes:
          - 用户可随时文本修正偏好
          - 聊天结果作用于未来匹配
      - F5｜Curated Job Database
        @notes:
          - 分层 scraping strategy
          - 支持 Excel upload
          - 职位标签与来源管理
      - F6｜Pricing + Referral System
        @notes:
          - 免费层 / 付费层
          - 推荐奖励
          - Beta tester 1 年免费
      - F7｜Event Tracking
        @notes:
          - 从 day 1 埋点
          - 支撑 Activation / WAU / Match acceptance / Retention / Conversion
    - Soft-launch Success Gate（8-week evaluation）
      @notes:
        - 这是 P0 是否通过验证的判定门，不是下一阶段功能
      - Activation > 70%
      - WAU > 40%
      - Match acceptance > 15%
      - Week-4 retention > 30%
      - Free → paid conversion > 20%
  - Phase 2｜P1（Months 2-5）
    @notes:
      - 目标：从单边 C 端匹配，扩展到渠道增强与 B 端能力
    - WeChat 小程序 notification binding
      @notes:
        - 在微信内接收 condensed JD push
    - WeCom community channel
      @notes:
        - 朋友圈内容 + 私域群推送
    - WeChat / phone number auth
    - AI thinking process display
      @notes:
        - 展示推荐理由与 agent reasoning，增强信任
    - Employer onboarding
      @notes:
        - 企业直接在 Jobro 发岗位
    - One-click apply on platform
      @notes:
        - 从外跳申请升级为站内申请
    - Mutual interest matching
      @notes:
        - 候选人与雇主双向 interested 后触发面试协同
    - Employer dashboard
      @notes:
        - 公司侧查看候选人池、筛选、沟通
    - PMF testing / word-of-mouth growth
  - Phase 3｜P2（Months 6-10）
    @notes:
      - 目标：从香港扩展到中国大陆市场
    - Mainland-specific job sources and scraping
    - Localization for mainland platforms and user expectations
    - Geographic expansion of matching engine
    - Regulatory compliance for mainland operations
  - Phase 4｜P3（Months 11+）
    @notes:
      - 目标：从文本优先匹配升级到语音 onboarding 与高阶智能能力
    - 20-minute voice onboarding conversation
      @notes:
        - 用语音建立更完整 CandidateProfile
    - RIASEC + Big Five + Career Values
      @notes:
        - 作为隐式评估层集成进 voice flow
    - Personality-based discovery suggestions
      @notes:
        - 不只做 intent match，也做 discovery match
    - Voice pipeline（ASR → LLM → TTS）
    - Cantonese voice support
    - Peer signal layer
    - Warm intro matching
    - Ghost job detection / application tracker / coaching
    - A2A matching
      @notes:
        - Candidate agent 与 employer agent 自动协商匹配
