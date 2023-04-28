import { Contact } from './Contact'

export type GroupParticipant = (Contact & { isAdmin?: boolean, isSuperAdmin?: boolean, admin?: 'admin' | 'superadmin' | null })

export type ParticipantAction = 'add' | 'remove' | 'promote' | 'demote'

export interface GroupMetadata {
    id: string
    owner: string | undefined
    subject: string
    /** propietario del sujeto grupal */
    subjectOwner?: string
    /** Fecha de modificación del sujeto grupal */
    subjectTime?: number
    creation?: number
    desc?: string
    descOwner?: string
    descId?: string
    /** se establece cuando el grupo solo permite a los administradores cambiar la configuración del grupo */
    restrict?: boolean
    /** se establece cuando el grupo solo permite a los administradores escribir mensajes */
    announce?: boolean
    /** Número de participantes del grupo */
    size?: number
    // Matriz modificada de Baileys
    participants: GroupParticipant[]
    ephemeralDuration?: number
    inviteCode?: string
}


export interface WAGroupCreateResponse {
    status: number
    gid?: string
    participants?: [{ [key: string]: {} }]
}

export interface GroupModificationResponse {
    status: number
    participants?: { [key: string]: {} }
}