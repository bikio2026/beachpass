import { STATION_STATUS } from '../../lib/constants'
import { Badge } from './Badge'

export function StatusBadge({ status }) {
  const info = STATION_STATUS[status] || STATION_STATUS.closed
  return <Badge variant={info.color}>{info.label}</Badge>
}
