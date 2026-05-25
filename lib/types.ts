export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'OVERDUE' | 'MAINTENANCE'
export type RoomType = 'Standard' | 'Deluxe'

export type Roommate = {
  name: string
  phone: string
}

export type Tenant = {
  id: string
  name: string
  phone: string
  email: string
  start_date: string
  end_date: string
  roommates: Roommate[]
}

export type MaintenanceRequest = {
  id: string
  title: string
  description: string
  submitted_at: string
}

export type Room = {
  id: number
  room_number: string
  floor: 1 | 2 | 3
  room_type: RoomType
  base_price: number
  status: RoomStatus
  tenant?: Tenant
  maintenance_request?: MaintenanceRequest
}
