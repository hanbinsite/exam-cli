# CLI API 文档

> 供命令行 / Postman / 脚本查询使用，CLI 端点采用 `X-Code` 认证，不使用 User JWT。

## 基础信息

- **Base URL**: `https://exam-server.hanbin123.com/api/v1`
- **响应格式**: 所有接口统一返回 `{ "code": int, "data": ..., "message": str }`
- **CLI 认证方式**: 请求头携带 `X-Code: <6位查询码>`
- **查询码获取方式**: 先通过用户端登录，再调用用户接口获取或重置查询码
- **能力边界**: CLI 仅提供只读查询，不提供考试提交、进度保存等写操作

---

## 1. CLI 认证说明

### 1.1 X-Code 请求头

示例：

```http
X-Code: A3K9X2
```

### 1.2 安全约束

| 约束 | 说明 |
|------|------|
| 只读 | CLI 端点只有 GET，无写入能力 |
| 固定 study 模式 | 返回答案 + 解析，不支持 exam / practice |
| 科目隔离 | 复用用户科目授权体系 |
| 免登录 | 不使用 Bearer Token，直接用 X-Code |
| 可轮换 | 可通过用户接口重新生成查询码 |

---

## 2. 查询码管理（用户端接口）

> 下面两个接口属于用户认证体系，调用时仍需 **User JWT**，但它们服务于 CLI 使用场景，因此统一放在本文件中说明。

### 2.1 查看我的查询码

```
GET /api/v1/auth/my-code
```

**需 User JWT**

> 查看当前用户的查询码；如果尚未生成，系统会自动生成并返回。

成功响应：
```json
{
  "code": 200,
  "data": {
    "user_code": "A3K9X2"
  },
  "message": "success"
}
```

### 2.2 重新生成查询码

```
PUT /api/v1/auth/regenerate-code
```

**需 User JWT**

> 重新生成查询码，旧码立即失效。

成功响应：
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

## 3. CLI 科目接口

### 3.1 获取我的科目列表

```
GET /api/v1/cli/subjects
```

**需 X-Code 认证**

> 返回当前用户被授权的科目列表。

成功响应：
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

### 3.2 获取科目详情

```
GET /api/v1/cli/subjects/{subject_id}
```

**需 X-Code 认证 + 用户科目授权**

成功响应：
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

## 4. CLI 题型与知识点

### 4.1 获取科目题型列表

```
GET /api/v1/cli/subjects/{subject_id}/question-types
```

**需 X-Code 认证 + 用户科目授权**

成功响应：
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

### 4.2 获取知识点树

```
GET /api/v1/cli/subjects/{subject_id}/knowledge-points
```

**需 X-Code 认证 + 用户科目授权**

成功响应：
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "区块链基础",
      "parent_id": null,
      "children": [
        {
          "id": 2,
          "name": "共识机制",
          "parent_id": 1,
          "children": []
        }
      ]
    }
  ],
  "message": "success"
}
```

---

## 5. CLI 题目接口

### 5.1 获取科目题目列表

```
GET /api/v1/cli/subjects/{subject_id}/questions?type={typeName}&difficulty={level}&page=1&pageSize=20
```

**需 X-Code 认证 + 用户科目授权**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| subject_id | string | 是 | 科目 ID（路径参数） |
| type | string | 否 | 按题型名过滤（choice/judgment 等） |
| difficulty | string | 否 | 按难度过滤（easy/medium/hard） |
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页数量，默认 20，最大 100 |

> 固定 study 模式，返回答案 + 解析 + 高亮标记。

成功响应：
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

### 5.2 获取题目统计

```
GET /api/v1/cli/subjects/{subject_id}/questions/stats
```

**需 X-Code 认证 + 用户科目授权**

成功响应：
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

### 5.3 获取单题详情

```
GET /api/v1/cli/questions/{question_id}
```

**需 X-Code 认证**

> 固定 study 模式，返回答案 + 解析；服务端会校验当前用户对题目所属科目的访问权限。

成功响应：
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

## 6. CLI 学习资料接口

### 6.1 获取科目学习资料列表

```
GET /api/v1/cli/subjects/{subject_id}/materials?type={type}&page=1&pageSize=20
```

**需 X-Code 认证 + 用户科目授权**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| subject_id | string | 是 | 科目 ID（路径参数） |
| type | string | 否 | 资料类型过滤 |
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页数量，默认 20，最大 100 |

成功响应：
```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "subject_id": "blockchain",
        "type": "guide",
        "title": "搭建以太坊开发环境",
        "summary": "环境搭建指南",
        "tags": ["以太坊", "开发环境"],
        "sort_order": 1
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  },
  "message": "success"
}
```

### 6.2 获取学习资料详情

```
GET /api/v1/cli/materials/{material_id}
```

**需 X-Code 认证**

> 服务端会校验当前用户是否有该资料所属科目的访问权限。

成功响应：
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "subject_id": "blockchain",
    "type": "guide",
    "title": "搭建以太坊开发环境",
    "content": "本实操将引导你完成以太坊开发环境的搭建...",
    "meta": {
      "steps": ["步骤1: 安装Node.js", "步骤2: 安装Truffle"],
      "expected_output": "Truffle v5.0.0"
    },
    "summary": "环境搭建指南",
    "tags": ["以太坊", "开发环境"],
    "sort_order": 1
  },
  "message": "success"
}
```

---

## 7. CLI 使用示例

```bash
# 查我的科目
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects

# 查科目详情
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain

# 查题型列表
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/question-types

# 查知识点树
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/knowledge-points

# 查某科选择题列表
curl -H "X-Code: A3K9X2" "https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/questions?type=choice"

# 查题目统计
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/questions/stats

# 查单题答案
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/questions/42

# 查资料列表
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/subjects/blockchain/materials

# 查资料详情
curl -H "X-Code: A3K9X2" https://exam-server.hanbin123.com/api/v1/cli/materials/10
```
