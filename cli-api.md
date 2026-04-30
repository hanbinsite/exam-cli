# CLI API 文档（最终精修版）

> 适用于命令行工具、脚本、Postman、嵌入式设备等只读查询场景。CLI 端点使用 `X-Code` 认证，不使用 JWT。

---

## 目录

- [1. 文档说明](#1-文档说明)
- [2. 认证与访问控制](#2-认证与访问控制)
- [3. 查询码管理（用户端接口）](#3-查询码管理用户端接口)
- [4. 科目接口](#4-科目接口)
- [5. 题型与知识点](#5-题型与知识点)
- [6. 题目接口](#6-题目接口)
- [7. 学习资料接口](#7-学习资料接口)
- [8. CLI 使用示例](#8-cli-使用示例)
- [9. 接口索引表](#9-接口索引表)
- [10. 错误响应示例](#10-错误响应示例)
- [11. 限流说明](#11-限流说明)

---

## 1. 文档说明

### 1.1 基础信息
- **Base URL**: `https://exam-server.hanbin123.com/api/v1`
- **认证方式**: 请求头 `X-Code: <6位查询码>`
- **能力边界**: 只读查询，不支持考试提交、答题进度保存等写操作
- **固定题目模式**: CLI 题目接口固定使用 `study` 视图

### 1.2 统一响应结构
```json
{
  "code": 200,
  "data": {},
  "message": "success"
}
```

### 1.3 时间格式约定
文档中的时间统一采用 ISO 8601 示例，例如：
- `2026-04-21T10:00:00+00:00`

---

## 2. 认证与访问控制

### 2.1 查询码说明
- 查询码来源于用户端：`GET /auth/my-code` 或 `PUT /auth/regenerate-code`
- 当前系统自动生成的查询码为 **6 位** 大写字母数字组合
- 自动排除易混淆字符：`0/O/I/L`

### 2.2 用户科目访问权限
- 当 `REQUIRE_USER_SUBJECT_AUTH=true` 时，CLI 访问科目内资源需具备用户科目访问权限
- 当 `REQUIRE_USER_SUBJECT_AUTH=false` 时，CLI 跳过科目访问权限检查，仅要求有效 `X-Code`

### 2.3 常见失败场景

| 场景 | 结果 |
|------|------|
| 未传 `X-Code` | 401：`X-Code header required` |
| 查询码无效 | 401：`Invalid or deactivated code` |
| 查询码对应用户已停用 | 401：`Invalid or deactivated code` |
| 无科目访问权限 | 403：`No access to subject '{subject_id}'` |

---

## 3. 查询码管理（用户端接口）

> 下列接口属于用户端接口，调用时仍需 User JWT，但它们直接服务于 CLI 场景，因此在 CLI 文档中一并说明。

### 3.1 获取我的查询码
- **方法**: `GET`
- **路径**: `/auth/my-code`
- **认证**: 需 User JWT
- **权限**: 无

**成功响应**
```json
{
  "code": 200,
  "data": {
    "user_code": "A3K9X2"
  },
  "message": "success"
}
```

### 3.2 重新生成查询码
- **方法**: `PUT`
- **路径**: `/auth/regenerate-code`
- **认证**: 需 User JWT
- **权限**: 无

**成功响应**
```json
{
  "code": 200,
  "data": {
    "user_code": "B7M2P4"
  },
  "message": "success"
}
```

---

## 4. 科目接口

### 4.1 获取我的科目列表
- **方法**: `GET`
- **路径**: `/cli/subjects`
- **认证**: 需 `X-Code`
- **权限**: 无

**成功响应**
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "blockchain",
        "name": "区块链技术",
        "description": "区块链技术基础与应用",
        "category": "计算机",
        "icon": "https://example.com/icon.png"
      }
    ],
    "total": 1
  },
  "message": "success"
}
```

### 4.2 获取科目详情
- **方法**: `GET`
- **路径**: `/cli/subjects/{subject_id}`
- **认证**: 需 `X-Code`
- **权限**: 用户科目访问权限

**成功响应**
```json
{
  "code": 200,
  "data": {
    "id": "blockchain",
    "name": "区块链技术",
    "description": "区块链技术基础与应用",
    "category": "计算机",
    "icon": "https://example.com/icon.png",
    "is_active": true
  },
  "message": "success"
}
```

---

## 5. 题型与知识点

### 5.1 获取题型列表
- **方法**: `GET`
- **路径**: `/cli/subjects/{subject_id}/question-types`
- **认证**: 需 `X-Code`
- **权限**: 用户科目访问权限

**成功响应**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "subject_id": "blockchain",
      "name": "choice",
      "display_name": "单选题",
      "has_options": true,
      "has_sub_questions": false,
      "scoring_type": "auto",
      "default_score": 1.0,
      "sort_order": 1
    }
  ],
  "message": "success"
}
```

### 5.2 获取知识点树
- **方法**: `GET`
- **路径**: `/cli/subjects/{subject_id}/knowledge-points`
- **认证**: 需 `X-Code`
- **权限**: 用户科目访问权限

**成功响应**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "subject_id": "blockchain",
      "parent_id": null,
      "name": "区块链基础",
      "description": "区块链基础知识",
      "sort_order": 1,
      "is_active": true,
      "children": [
        {
          "id": 2,
          "subject_id": "blockchain",
          "parent_id": 1,
          "name": "共识机制",
          "description": null,
          "sort_order": 2,
          "is_active": true,
          "children": null
        }
      ]
    }
  ],
  "message": "success"
}
```

---

## 6. 题目接口

### 6.1 获取题目列表
- **方法**: `GET`
- **路径**: `/cli/subjects/{subject_id}/questions`
- **认证**: 需 `X-Code`
- **权限**: 用户科目访问权限

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 题型名过滤 |
| difficulty | string | 否 | 难度过滤 |
| page | int | 否 | 默认 1 |
| pageSize | int | 否 | 默认 20，最大 100 |

**成功响应**
```json
{
  "code": 200,
  "data": {
    "subject": {"id": "blockchain"},
    "stats": {"choice": 174, "judgment": 36},
    "questions": [
      {
        "id": 1,
        "type": {"name": "choice", "display_name": "单选题"},
        "category": "职业素养",
        "difficulty": "medium",
        "title": "职业素养的构成除了敬业精神，还应包括（）。",
        "content": {
          "options": [
            {"key": "A", "text": "创新精神"},
            {"key": "B", "text": "合作的态度"},
            {"key": "C", "text": "创新精神与合作的态度"},
            {"key": "D", "text": "敬业精神"}
          ]
        },
        "score": 1.0,
        "answer": "C",
        "explanation": "职业素养的构成除了敬业精神，还应包括合作的态度。",
        "highlight": {"correct_keys": ["C"]}
      }
    ],
    "total": 210,
    "page": 1,
    "page_size": 20
  },
  "message": "success"
}
```

### 6.2 获取题目统计
- **方法**: `GET`
- **路径**: `/cli/subjects/{subject_id}/questions/stats`
- **认证**: 需 `X-Code`
- **权限**: 用户科目访问权限

**成功响应**
```json
{
  "code": 200,
  "data": {
    "by_type": {
      "choice": 174,
      "judgment": 36,
      "material": 2
    },
    "by_difficulty": {
      "easy": 50,
      "medium": 130,
      "hard": 30
    }
  },
  "message": "success"
}
```

### 6.3 获取单题详情
- **方法**: `GET`
- **路径**: `/cli/questions/{question_id}`
- **认证**: 需 `X-Code`
- **权限**: 服务端会校验题目所属科目的访问权限

**成功响应**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "type": {"name": "choice", "display_name": "单选题"},
    "category": "职业素养",
    "difficulty": "medium",
    "title": "职业素养的构成除了敬业精神，还应包括（）。",
    "content": {
      "options": [
        {"key": "A", "text": "创新精神"},
        {"key": "B", "text": "合作的态度"},
        {"key": "C", "text": "创新精神与合作的态度"},
        {"key": "D", "text": "敬业精神"}
      ]
    },
    "score": 1.0,
    "answer": "C",
    "explanation": "职业素养的构成除了敬业精神，还应包括合作的态度。",
    "highlight": {"correct_keys": ["C"]}
  },
  "message": "success"
}
```

---

## 7. 学习资料接口

### 7.1 获取资料列表
- **方法**: `GET`
- **路径**: `/cli/subjects/{subject_id}/materials`
- **认证**: 需 `X-Code`
- **权限**: 用户科目访问权限

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 资料类型过滤 |
| page | int | 否 | 默认 1 |
| pageSize | int | 否 | 默认 20，最大 100 |

### 7.2 获取资料详情
- **方法**: `GET`
- **路径**: `/cli/materials/{material_id}`
- **认证**: 需 `X-Code`
- **权限**: 服务端会校验资料所属科目的访问权限

---

## 8. CLI 使用示例

```bash
# 查我的科目
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects

# 查科目详情
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain

# 查题型
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/question-types

# 查知识点树
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/knowledge-points

# 查题目列表
curl -H "X-Code: A3K9X2" "https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/questions?type=choice"

# 查题目统计
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/questions/stats

# 查单题详情
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/questions/42

# 查资料列表
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/materials

# 查资料详情
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/materials/10
```

---

## 9. 接口索引表

| 模块 | 方法 | 路径 |
|------|------|------|
| 查询码 | GET | `/auth/my-code` |
| 查询码 | PUT | `/auth/regenerate-code` |
| 科目 | GET | `/cli/subjects` |
| 科目 | GET | `/cli/subjects/{subject_id}` |
| 题型 | GET | `/cli/subjects/{subject_id}/question-types` |
| 知识点 | GET | `/cli/subjects/{subject_id}/knowledge-points` |
| 题目 | GET | `/cli/subjects/{subject_id}/questions` |
| 题目 | GET | `/cli/subjects/{subject_id}/questions/stats` |
| 题目 | GET | `/cli/questions/{question_id}` |
| 资料 | GET | `/cli/subjects/{subject_id}/materials` |
| 资料 | GET | `/cli/materials/{material_id}` |

---

## 10. 错误响应示例

### 10.1 未携带 X-Code
```json
{
  "code": 401,
  "data": null,
  "message": "X-Code header required"
}
```

### 10.2 查询码无效或用户已停用
```json
{
  "code": 401,
  "data": null,
  "message": "Invalid or deactivated code"
}
```

### 10.3 无科目访问权限
```json
{
  "code": 403,
  "data": null,
  "message": "No access to subject 'blockchain'"
}
```

---

## 11. 限流说明

| 路径模式 | 限制 | 时间窗口 |
|----------|------|----------|
| `/auth/login` | 10 次 | 60 秒 |
| `/auth/register` | 5 次 | 60 秒 |
| `/admin/auth/login` | 10 次 | 60 秒 |
| `/admin/auth/register` | 3 次 | 60 秒 |
| `/exams/session/*` | 20 次 | 60 秒 |
| `/cli/*` | 5 次 | 60 秒 |
| 其他端点 | 100 次 | 60 秒 |

**排除限流的端点**：`/health`、`/ping`、`/docs`、`/openapi.json`、`/redoc`
