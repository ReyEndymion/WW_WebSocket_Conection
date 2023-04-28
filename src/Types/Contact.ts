export interface Contact {
    id: string
    /** Nombre del contacto, ha guardado en su WA */
    name?: string
    /** Nombre del contacto, el contacto se ha establecido por su cuenta en WA */
    notify?: string
    /** No tengo ni idea */
    verifiedName?: string
    // Baileys agregó
    /**
     * URL de la foto de perfil del contacto
     *
     * 'changed' => Si la foto de perfil ha cambiado
     * null => Si la imagen de perfil no se ha configurado (imagen de perfil predeterminada)
     * cualquier otro string => url de la foto de perfil
     */
    imgUrl?: string | null | 'changed'
    status?: string
}