import { useSyncExternalStore } from 'react'
import { getUtSession, subscribeUtSession } from './utStore'

/**
 * 화면에서 세션 변경을 따라 다시 그리기 위한 훅.
 * 컴포넌트 맨 위에서 useUtSession()을 부르고, 값은 utStore.ts의 조회 함수로 읽는다.
 *
 * const session = useUtSession()
 * const items = getBriefingItems()
 */
export function useUtSession() {
  return useSyncExternalStore(subscribeUtSession, getUtSession)
}
