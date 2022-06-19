import request from '../utils/request'

export interface ComboBox {
    id: string | number
    name: string
    isActive: number
    isDeleted: number
    children?: ComboBox[]
    customData?: any
    disabled?: boolean
}

export async function getSignupSpot() {
    return request.postJson('/api/signupspot')
}

export async function getComboBox(api: string, data?: object, base?: string) {
    return request.postJson<ComboBox[]>(api, data, base)
}
