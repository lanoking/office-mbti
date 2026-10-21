import type { AxisId, Pole } from './axes';

export type Choice = 'A' | 'B';

export interface QuestionOption {
  text: string;
  /** 이 선택지를 고르면 +1 되는 성향 */
  pole: Pole;
}

export interface Question {
  id: string;
  axis: AxisId;
  /** 상황 묘사 이모지 */
  emoji: string;
  prompt: string;
  A: QuestionOption;
  B: QuestionOption;
}

// 축마다 3문항씩, 총 12문항. 축이 번갈아 나오도록 배치했고
// A 선택지가 항상 같은 성향이 되지 않도록 섞어 두었다.
export const QUESTIONS: readonly Question[] = [
  {
    id: 'q1',
    axis: 'EI',
    emoji: '☕',
    prompt: '월요일 아침, 출근하자마자 나는',
    A: { text: '커피 들고 자리 돌며 주말 근황 토크부터', pole: 'E' },
    B: { text: '이어폰 끼고 오늘 할 일 목록부터 정리', pole: 'I' },
  },
  {
    id: 'q2',
    axis: 'PF',
    emoji: '🗓️',
    prompt: '새 프로젝트가 떨어졌다. 가장 먼저 하는 일은?',
    A: { text: '일단 부딪혀 보면서 방향을 잡는다', pole: 'F' },
    B: { text: '일정표와 체크리스트부터 만든다', pole: 'P' },
  },
  {
    id: 'q3',
    axis: 'LH',
    emoji: '🤔',
    prompt: '두 가지 안 중 하나를 골라야 할 때 나는',
    A: { text: '숫자와 근거 자료를 먼저 비교한다', pole: 'L' },
    B: { text: '팀원들이 어떻게 느낄지 먼저 생각한다', pole: 'H' },
  },
  {
    id: 'q4',
    axis: 'DS',
    emoji: '🙋',
    prompt: '회의에서 “이거 누가 맡을까요?” 하는 순간',
    A: { text: '누가 맡든 필요한 부분을 옆에서 돕겠다고 한다', pole: 'S' },
    B: { text: '“제가 해볼게요” 손이 먼저 올라간다', pole: 'D' },
  },
  {
    id: 'q5',
    axis: 'EI',
    emoji: '💬',
    prompt: '애매한 업무 지시를 받았다. 나는',
    A: { text: '메신저로 정리해서 차분히 질문한다', pole: 'I' },
    B: { text: '바로 자리로 찾아가 말로 물어본다', pole: 'E' },
  },
  {
    id: 'q6',
    axis: 'PF',
    emoji: '⏰',
    prompt: '마감 3일 전, 내 상태는?',
    A: { text: '이미 80%는 끝내 두고 검토 중', pole: 'P' },
    B: { text: '아이디어는 다 있다. 이제 몰아서 할 차례', pole: 'F' },
  },
  {
    id: 'q7',
    axis: 'LH',
    emoji: '📝',
    prompt: '동료의 보고서를 검토해 달라는 부탁을 받았다',
    A: { text: '좋은 점을 먼저 말하고 고칠 점은 부드럽게', pole: 'H' },
    B: { text: '고칠 점을 항목별로 명확하게 정리', pole: 'L' },
  },
  {
    id: 'q8',
    axis: 'DS',
    emoji: '🚀',
    prompt: '팀 분위기가 처져 있을 때 나는',
    A: { text: '“이번 주에 이것까지 끝내 봐요!” 목표를 던진다', pole: 'D' },
    B: { text: '막힌 사람 없는지 살피고 일을 나눠 든다', pole: 'S' },
  },
  {
    id: 'q9',
    axis: 'EI',
    emoji: '🍱',
    prompt: '점심시간, 가장 끌리는 선택은?',
    A: { text: '여럿이 새로 생긴 맛집 탐방', pole: 'E' },
    B: { text: '혼밥하며 조용히 충전', pole: 'I' },
  },
  {
    id: 'q10',
    axis: 'PF',
    emoji: '🔀',
    prompt: '갑자기 일정이 바뀌었다는 공지가 떴다',
    A: { text: '오히려 좋아, 새 판에 맞춰 바로 움직인다', pole: 'F' },
    B: { text: '전체 일정표를 다시 짜야 마음이 놓인다', pole: 'P' },
  },
  {
    id: 'q11',
    axis: 'LH',
    emoji: '😵',
    prompt: '팀원이 큰 실수를 했다. 내 첫 반응은?',
    A: { text: '원인을 분석해 재발 방지책부터 찾는다', pole: 'L' },
    B: { text: '“괜찮아요?” 먼저 마음부터 챙긴다', pole: 'H' },
  },
  {
    id: 'q12',
    axis: 'DS',
    emoji: '🏆',
    prompt: '프로젝트가 성공했다! 가장 뿌듯한 순간은?',
    A: { text: '모두가 덕분에 편했다고 말해 줄 때', pole: 'S' },
    B: { text: '내가 끌고 간 방향이 맞았다고 확인될 때', pole: 'D' },
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
