# Jobro API 文档

> 基础路径：`http://localhost:3001/api`
> 双语支持：通过 `?lang=zh-CN` 查询参数或 `Accept-Language` 请求头切换语言
> 认证方式：`Authorization: Bearer <token>` + `X-User-Id: <userId>`

---

## 通用说明

### 响应格式

**成功响应**：直接返回数据对象

**错误响应**：

```json
{
  "error": "auth.invalid_token",
  "message": "Invalid token"
}
```

- `error` — 翻译键（机器可读，前端可用于逻辑判断）
- `message` — 翻译后文本（人类可读，`?lang=zh-CN` 时返回中文）

### 分页参数

所有列表接口支持以下查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `limit` | number | 20 | 每页数量（最大 100） |
| `sort` | string | `created_at` | 排序字段 |
| `order` | string | `desc` | `asc` 或 `desc` |

分页响应格式：

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "totalPages": 5
}
```

---

## 1. 认证 — `/api/auth`

### POST /api/auth/register

注册新用户。

**请求体：**

```json
{ "email": "user@example.com", "password": "123456" }
```

**响应：**

```json
{
  "token": "a1b2c3...",
  "user": { "id": 1, "email": "user@example.com", "role": "user" }
}
```

### POST /api/auth/login

用户登录。

**请求体：**

```json
{ "email": "user@example.com", "password": "123456" }
```

**响应：**

```json
{
  "token": "a1b2c3...",
  "user": { "id": 1, "email": "user@example.com", "role": "user" }
}
```

> admin 用户登录后 `role` 为 `"admin"`。

---

## 2. 用户资料 — `/api/profiles`

### GET /api/profiles/me

获取当前用户资料。

**查询参数：** `user_id` (number, 必填)

**响应：**

```json
{
  "id": 1,
  "user_id": 1,
  "name": "张三",
  "education": [...],
  "experience": [...],
  "skills": "Python, React",
  "raw_resume_text": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

### PUT /api/profiles/me

创建或更新用户资料。

**查询参数：** `user_id` (number, 必填)

**请求体：**

```json
{
  "name": "张三",
  "education": [...],
  "experience": [...],
  "skills": "Python, React",
  "raw_resume_text": "..."
}
```

### POST /api/profiles/resume-upload

上传 PDF 简历，自动解析提取结构化数据。

**请求：** `multipart/form-data`，字段名 `resume`，最大 5MB

---

## 3. 偏好设置 — `/api/preferences`

### GET /api/preferences

获取用户偏好。

**查询参数：** `user_id` (number, 必填)

### POST /api/preferences

创建或更新用户偏好（upsert）。

**请求体：**

```json
{
  "user_id": 1,
  "target_roles": "前端工程师, 全栈开发",
  "target_industries": "互联网, 金融科技",
  "target_locations": "北京, 上海",
  "salary_min": 15000,
  "salary_max": 30000,
  "company_size": "50-200人",
  "other_notes": "希望远程"
}
```

---

## 4. 职位 — `/api/jobs`

### GET /api/jobs

获取活跃职位列表（仅返回 `status=active` 的职位）。

**查询参数：** `limit`, `offset`

### POST /api/jobs/bulk

批量导入职位。

**请求体：** 职位数组

```json
[
  {
    "title": "前端工程师",
    "company": "某科技公司",
    "location": "北京",
    "description": "...",
    "salary_min": 20000,
    "salary_max": 35000
  }
]
```

---

## 5. 匹配 — `/api/matching`

### GET /api/matching/recommendations

获取推荐结果。

**查询参数：** `user_id` (必填), `limit`

### POST /api/matching/run

触发匹配计算。

**请求体：**

```json
{ "user_id": 1, "limit": 10 }
```

---

## 6. 反馈 — `/api/feedback`

### POST /api/feedback

更新匹配状态（接受/拒绝等）。

**请求体：**

```json
{ "match_id": 1, "type": "accepted", "comment": "很感兴趣" }
```

---

## 7. 聊天 — `/api/chat`

### POST /api/chat

发送消息给 AI 职业助手。

**请求体：**

```json
{ "user_id": 1, "message": "我想找金融行业的前端岗位" }
```

**响应：**

```json
{ "reply": "好的，我来帮你筛选金融行业的前端岗位..." }
```

---

## 8. 事件追踪 — `/api/events`

### POST /api/events

记录分析事件。

**请求体：**

```json
{ "event_type": "page_view", "user_id": 1, "payload": { "page": "dashboard" } }
```

---

## 9. 健康检查 — `/api/health`

### GET /api/health

```json
{ "ok": true, "env": "development" }
```

---

## 10. 管理面板 — `/api/admin`

> 所有 admin 接口需同时提供 `Authorization: Bearer <token>` 和 `X-User-Id: <userId>` 请求头。
> 仅 `role=admin` 的用户可访问，否则返回 403。

### 10a. 用户管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/users` | 用户列表（支持 `search` 搜索） |
| GET | `/api/admin/users/:id` | 用户详情 |
| PUT | `/api/admin/users/:id` | 更新用户（`role`: `user`/`admin`，`email`） |
| DELETE | `/api/admin/users/:id` | 删除用户（级联删除关联数据） |
| GET | `/api/admin/users/:id/profile` | 用户简历 |
| GET | `/api/admin/users/:id/preferences` | 用户偏好 |
| GET | `/api/admin/users/:id/conversations` | 用户聊天记录 |
| GET | `/api/admin/users/:id/matches` | 用户匹配记录（支持 `status` 筛选） |

**GET /api/admin/users 响应示例：**

```json
{
  "data": [
    { "id": 1, "email": "user@example.com", "role": "user", "created_at": "...", "name": "张三" }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

**PUT /api/admin/users/:id 请求体：**

```json
{ "role": "admin" }
```

### 10b. 职位管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/jobs` | 职位列表（支持 `status`, `search`, `company`, `industry` 筛选） |
| GET | `/api/admin/jobs/:id` | 职位详情 |
| POST | `/api/admin/jobs` | 创建职位 |
| PUT | `/api/admin/jobs/:id` | 更新职位 |
| DELETE | `/api/admin/jobs/:id` | 删除职位 |
| PATCH | `/api/admin/jobs/:id/status` | 更新职位状态 |

**职位状态值：** `active`, `paused`, `closed`, `archived`

**POST /api/admin/jobs 请求体：**

```json
{
  "title": "前端工程师",
  "company": "某科技公司",
  "location": "北京",
  "description": "...",
  "requirements": "...",
  "responsibilities": "...",
  "salary_min": 20000,
  "salary_max": 35000,
  "salary_currency": "HKD",
  "deadline": "2026-06-30",
  "job_type": "full-time",
  "industry": "Technology",
  "role_type": "frontend",
  "seniority": "mid",
  "tags": ["react", "typescript"],
  "status": "active"
}
```

### 10c. 匹配管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/matches` | 匹配列表（支持 `status`, `user_id`, `job_id`, `min_score` 筛选） |
| PATCH | `/api/admin/matches/:id/status` | 更新匹配状态 |
| DELETE | `/api/admin/matches/:id` | 删除匹配 |
| POST | `/api/admin/matches/bulk-status` | 批量更新匹配状态 |

**匹配状态值：** `pending`, `accepted`, `rejected`, `expired`

**POST /api/admin/matches/bulk-status 请求体：**

```json
{ "match_ids": [1, 2, 3], "status": "accepted" }
```

**响应：**

```json
{ "updated": 3 }
```

### 10d. 数据分析

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/analytics/overview` | 总览统计 |
| GET | `/api/admin/analytics/users-over-time` | 用户注册趋势（`?days=30`） |
| GET | `/api/admin/analytics/jobs-by-industry` | 职位行业分布 |
| GET | `/api/admin/analytics/match-stats` | 匹配状态分布与均分 |
| GET | `/api/admin/analytics/chat-usage` | 聊天消息量趋势（`?days=30`） |

**GET /api/admin/analytics/overview 响应示例：**

```json
{
  "totalUsers": 120,
  "totalJobs": 350,
  "totalMatches": 1200,
  "activeJobs": 280,
  "pendingMatches": 400,
  "avgMatchScore": 0.72
}
```

### 10e. 会话日志

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/conversations` | 所有会话列表（支持 `user_id`, `search` 筛选） |

### 10f. 系统管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/system/health` | 系统健康检查 |
| GET | `/api/admin/system/config` | 获取所有系统配置 |
| PUT | `/api/admin/system/config/:key` | 更新配置值 |
| GET | `/api/admin/system/audit-log` | 管理员操作日志（支持 `admin_id`, `action` 筛选） |

**GET /api/admin/system/health 响应示例：**

```json
{
  "db": "ok",
  "dbSize": 40960,
  "totalUsers": 120,
  "totalJobs": 350,
  "uptime": 86400.5,
  "env": "production",
  "aiEnabled": true
}
```

**系统配置项：**

| Key | 默认值 | 说明 |
|-----|--------|------|
| `matching_threshold` | `0.5` | 最低匹配分数 |
| `max_daily_matches` | `50` | 每用户每日最大匹配数 |
| `ai_chat_enabled` | `true` | 是否启用 AI 聊天 |
| `maintenance_mode` | `false` | 系统维护模式 |

---

## 错误码参考

| 键 | HTTP | 说明 |
|----|------|------|
| `auth.missing_token` | 401 | 缺少认证令牌 |
| `auth.invalid_token` | 401 | 无效令牌 |
| `auth.insufficient_role` | 403 | 权限不足 |
| `auth.user_not_found` | 401 | 用户未找到 |
| `auth.no_user_context` | 401 | 未提供用户上下文 |
| `auth.invalid_password` | 401 | 密码错误 |
| `auth.missing_credentials` | 400 | 缺少邮箱或密码 |
| `user.not_found` | 404 | 用户未找到 |
| `user.invalid_role` | 400 | 无效的角色值 |
| `job.not_found` | 404 | 职位未找到 |
| `job.title_required` | 400 | 职位名称为必填项 |
| `job.company_required` | 400 | 公司名称为必填项 |
| `job.invalid_status` | 400 | 无效的职位状态 |
| `match.not_found` | 404 | 匹配未找到 |
| `match.invalid_status` | 400 | 无效的匹配状态 |
| `match.ids_required` | 400 | 匹配ID和状态为必填项 |
| `config.not_found` | 404 | 配置项未找到 |
| `internal.server_error` | 500 | 服务器内部错误 |
