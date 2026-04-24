export interface RouteConfig {
  target: string;
  method?: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

const BASE_URL = "https://exam-server.hanbin123.com/api/v1";

const routes: Record<string, RouteConfig> = {
  // 2. 查询码管理（用户端接口）- 注意：这两个接口需要 User JWT (Bearer Token)
  "auth.myCode": {
    target: `${BASE_URL}/auth/my-code`,
    method: "GET",
  },
  "auth.regenerateCode": {
    target: `${BASE_URL}/auth/regenerate-code`,
    method: "PUT",
  },

  // 3. CLI 科目接口
  "subjects": {
    target: `${BASE_URL}/cli/subjects`,
    method: "GET",
  },
  "subjectDetail": {
    target: `${BASE_URL}/cli/subjects/{subject_id}`,
    method: "GET",
  },

  // 4. CLI 题型与知识点
  "questionTypes": {
    target: `${BASE_URL}/cli/subjects/{subject_id}/question-types`,
    method: "GET",
  },
  "knowledgePoints": {
    target: `${BASE_URL}/cli/subjects/{subject_id}/knowledge-points`,
    method: "GET",
  },

  // 5. CLI 题目接口
  "questions": {
    target: `${BASE_URL}/cli/subjects/{subject_id}/questions`,
    method: "GET",
  },
  "questionStats": {
    target: `${BASE_URL}/cli/subjects/{subject_id}/questions/stats`,
    method: "GET",
  },
  "questionDetail": {
    target: `${BASE_URL}/cli/questions/{question_id}`,
    method: "GET",
  },

  // 6. CLI 学习资料接口
  "materials": {
    target: `${BASE_URL}/cli/subjects/{subject_id}/materials`,
    method: "GET",
  },
  "materialDetail": {
    target: `${BASE_URL}/cli/materials/{material_id}`,
    method: "GET",
  },
};

export default routes;
