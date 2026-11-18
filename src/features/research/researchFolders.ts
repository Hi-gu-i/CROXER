/**
 * Task 4 리서치 화면의 폴더 구성.
 * Figma `홈에서 파일 나오기-Task 4`의 폴더 4개와 폴더 안 파일 묶음을 따른다.
 * 문서 제목과 본문은 초기 데이터의 자료(Resource)에서 읽고, 여기에는 화면 배치만 둔다.
 */

export type DocumentSource = 'pdf' | 'drive'

export interface ResearchFileGroup {
  title: string
  subtitle: string
  source: DocumentSource
  resourceIds: string[]
}

export interface ResearchFolder {
  id: string
  title: string
  groups: ResearchFileGroup[]
}

export const researchFolders: ResearchFolder[] = [
  {
    id: 'summary',
    title: '핵심 요약',
    groups: [
      {
        title: '어제 밤 정리',
        subtitle: '지역 활성화 사례 3가지를 한눈에',
        source: 'drive',
        resourceIds: ['resource-research-cases'],
      },
    ],
  },
  {
    id: 'cases',
    title: '활성화 사례',
    groups: [
      {
        title: '공간 활용',
        subtitle: '빈 점포와 유휴공간의 커뮤니티 거점화',
        source: 'pdf',
        resourceIds: ['resource-research-space-culture', 'resource-research-space-hub'],
      },
      {
        title: '주민 참여',
        subtitle: '주민이 운영하는 지역 프로그램',
        source: 'drive',
        resourceIds: ['resource-research-resident'],
      },
    ],
  },
  {
    id: 'compare',
    title: '사례 비교',
    groups: [
      {
        title: '비교 메모',
        subtitle: '우리 조 기준으로 세 사례 비교',
        source: 'drive',
        resourceIds: ['resource-research-compare'],
      },
    ],
  },
  {
    id: 'reference',
    title: '참고 자료',
    groups: [
      {
        title: '회의 준비',
        subtitle: '오늘 교양 3조 회의에서 정할 것',
        source: 'pdf',
        resourceIds: ['resource-research-agenda'],
      },
    ],
  },
]

/** 문서 맨 위에 작게 표시하는 출처 줄 */
export const documentLabel = 'CROXER RESEARCH  /  지역 활성화'
