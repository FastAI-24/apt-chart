/**
 * 질문/토론 주제 정의 — 각 항목별로 별도 Utterances 이슈에 댓글 연결
 */
export interface QuestionItem {
  id: string;
  title: string;
  description?: string;
}

export const QUESTIONS: QuestionItem[] = [
  {
    id: "data-source",
    title: "데이터 출처 및 전처리",
    description: "AI Stages 대회 데이터, 전처리 파이프라인에 대한 질문",
  },
  {
    id: "feature-importance",
    title: "피처 중요도 및 모델링",
    description: "te_coord_cluster, 교통 피처, 앙상블 등에 대한 질문",
  },
  {
    id: "visualization",
    title: "시각화 및 대시보드",
    description: "차트 해석, D3.js 구현, UI/UX 관련 질문",
  },
  {
    id: "general",
    title: "기타 질문",
    description: "프로젝트 전반, 협업, 실험 방법론 등",
  },
];
