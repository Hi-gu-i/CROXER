import { useState } from 'react'
import { ActivityHeader, Button } from '../../components'
import type { ActivityId, Resource } from '../../data/types'
import { IconArrowL, IconClose } from '../../icons'
import { ResImgFile } from '../../res-img'
import { getActivity, getResources, getRole, getScheduleByActivity } from '../../data/utStore'
import { useUtSession } from '../../data/useUtSession'
import { DocumentPage } from './DocumentPage'
import { researchFolders, type DocumentSource, type ResearchFolder } from './researchFolders'
import iconDrive from './assets/icon-drive.png'
import iconPdf from './assets/icon-pdf.png'
import styles from './research-activity-page.module.css'

type View =
  | { name: 'folders' }
  | { name: 'folder'; folderId: string }
  | { name: 'document'; folderId: string; resourceId: string }

interface ResearchActivityPageProps {
  activityId: ActivityId
  /** 활동의 UT 흐름을 마쳤을 때 한 번 부른다. 완료 처리와 전환 패널은 App이 맡는다 */
  onFinish: () => void
  /** 상단 홈 버튼. App이 홈 화면으로 보낸다(촬영·러닝과 같은 자리) */
  onHome?: () => void
}

const sourceIcon: Record<DocumentSource, { src: string; label: string; width: number; height: number }> = {
  pdf: { src: iconPdf, label: 'PDF', width: 18, height: 23 },
  drive: { src: iconDrive, label: '구글 드라이브', width: 22, height: 20 },
}

/** 폴더 구성에 맞춰 실제로 있는 자료만 묶는다. 자료가 없는 묶음은 보여 주지 않는다 */
function resolveFolder(folder: ResearchFolder, resources: Resource[]) {
  const byId = new Map(resources.map((resource) => [resource.id, resource]))
  const groups = folder.groups
    .map((group) => ({
      ...group,
      documents: group.resourceIds
        .map((id) => byId.get(id))
        .filter((resource): resource is Resource => Boolean(resource)),
    }))
    .filter((group) => group.documents.length > 0)
  const count = groups.reduce((sum, group) => sum + group.documents.length, 0)
  return { ...folder, groups, count }
}

/**
 * Task 4 지역 활성화 사례 리서치 검토.
 * 어제 밤 정리한 자료 열기 → 본문 → 같은 자료 목록으로 복귀 → 검토 마침.
 * Figma `홈에서 파일 나오기-Task 4`의 폴더 목록·폴더 열림 화면 기준. 본문 화면과 검토 마침은 시안에 없어 같은 스타일로 추가했다.
 */
export function ResearchActivityPage({ activityId, onFinish, onHome }: ResearchActivityPageProps) {
  useUtSession()
  const [view, setView] = useState<View>({ name: 'folders' })
  const [hasReviewed, setHasReviewed] = useState(false)

  const role = getRole(getActivity(activityId).roleId)
  const isDone = getScheduleByActivity(activityId).status === 'done'
  const folders = researchFolders.map((folder) => resolveFolder(folder, getResources(activityId)))
  const currentFolder = view.name === 'folders' ? null : folders.find((f) => f.id === view.folderId)
  const currentDocument =
    view.name === 'document'
      ? currentFolder?.groups.flatMap((group) => group.documents).find((doc) => doc.id === view.resourceId)
      : null

  function openDocument(folderId: string, resourceId: string) {
    setHasReviewed(true)
    setView({ name: 'document', folderId, resourceId })
  }

  return (
    <section className={styles.page}>
      {/* 폴더 4개 화면: 촬영·러닝과 같은 상단(AI · 역할 · 홈) */}
      {view.name === 'folders' && (
        <ActivityHeader roleLabel={role.label} roleTone="yellow" onHomeClick={onHome} />
      )}

      {view.name !== 'folders' && (
      <header className={styles.header}>
        {view.name === 'document' && currentFolder ? (
          <button
            type="button"
            className={`${styles.iconButton} ${styles.headerStart}`}
            aria-label={`${currentFolder.title} 목록으로 돌아가기`}
            onClick={() => setView({ name: 'folder', folderId: currentFolder.id })}
          >
            <IconArrowL />
          </button>
        ) : null}

        <h1 className={`${styles.headerTitle} ${styles.headerCenter}`}>
          {view.name === 'document' ? currentDocument?.title : currentFolder?.title}
        </h1>

        {view.name === 'folder' ? (
          <button
            type="button"
            className={`${styles.iconButton} ${styles.headerEnd}`}
            aria-label="자료 폴더 목록으로 닫기"
            onClick={() => setView({ name: 'folders' })}
          >
            <IconClose />
          </button>
        ) : null}
      </header>
      )}

      {view.name === 'folders' && (
        <ul className={styles.folderGrid} aria-label="어제 밤 정리한 자료">
          {folders.map((folder) => (
            <li key={folder.id}>
              <button
                type="button"
                className={styles.folderButton}
                onClick={() => setView({ name: 'folder', folderId: folder.id })}
              >
                <ResImgFile size={127} className={styles.folderImage} />
                <span className={styles.folderText}>
                  <span className={styles.folderTitle}>{folder.title}</span>
                  <span className={styles.folderCount}>자료 {folder.count}개</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {view.name === 'folder' && currentFolder && (
        <div className={styles.folderDetail}>
          <div className={styles.folderHero}>
            <ResImgFile size={127} className={styles.folderHeroImage} />
            <span className={styles.folderText}>
              <span className={styles.folderTitle}>{currentFolder.title}</span>
              <span className={styles.folderCount}>자료 {currentFolder.count}개</span>
            </span>
          </div>

          <div className={styles.groupList}>
            {currentFolder.groups.map((group) => {
              const icon = sourceIcon[group.source]
              return (
                <section key={group.title} className={styles.group}>
                  <div className={styles.groupHeader}>
                    <span className={styles.sourceTile}>
                      <img src={icon.src} width={icon.width} height={icon.height} alt={icon.label} />
                    </span>
                    <span className={styles.groupText}>
                      <span className={styles.groupTitle}>{group.title}</span>
                      <span className={styles.groupSubtitle}>{group.subtitle}</span>
                    </span>
                  </div>
                  <ul className={styles.thumbList}>
                    {group.documents.map((doc) => (
                      <li key={doc.id}>
                        <button
                          type="button"
                          className={styles.thumbButton}
                          aria-label={`${doc.title} 열기`}
                          onClick={() => openDocument(currentFolder.id, doc.id)}
                        >
                          <span className={styles.thumbViewport}>
                            <DocumentPage resource={doc} variant="thumb" />
                          </span>
                          <span className={styles.thumbFold} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>
      )}

      {view.name === 'document' && currentDocument && (
        <div className={styles.documentView}>
          <DocumentPage resource={currentDocument} variant="full" />
        </div>
      )}

      {/* 마친 뒤 유지하기로 남으면 자료만 다시 보는 화면이라 버튼을 숨긴다. 다음 활동은 하단 탭 홈에서 연다(#84) */}
      {hasReviewed && !isDone && view.name !== 'document' && (
        <div className={styles.footer}>
          <Button fullWidth onClick={onFinish}>
            검토 마침
          </Button>
        </div>
      )}
    </section>
  )
}
