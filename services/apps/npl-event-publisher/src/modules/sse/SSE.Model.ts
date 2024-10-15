export interface EventSourceMessage {
  type: string
  data: string
  lastEventId: string
  origin: string
}
