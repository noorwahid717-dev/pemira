import { ACTIVE_ELECTION_ID } from '../config/env'

let activeElectionId = ACTIVE_ELECTION_ID
let defaultElectionId = ACTIVE_ELECTION_ID

const isValidId = (value: unknown): value is number => Number.isFinite(value) && Number(value) > 0

export const getActiveElectionId = (): number => (isValidId(activeElectionId) ? activeElectionId : defaultElectionId)

export const setActiveElectionId = (value: number) => {
  if (isValidId(value)) {
    activeElectionId = value
  }
}

export const getDefaultElectionId = (): number => defaultElectionId

export const setDefaultElectionId = (value: number) => {
  if (isValidId(value)) {
    defaultElectionId = value
    if (!isValidId(activeElectionId)) {
      activeElectionId = value
    }
  }
}

export const resetActiveElectionId = () => {
  activeElectionId = defaultElectionId
}
