// 统一的角色定义与判断逻辑
// 系统角色枚举：student（学生）、teacher（教师）、lf_admin（失物招领管理员）、sys_admin（系统管理员）
export const ADMIN_ROLES = ['lf_admin', 'sys_admin']

// 角色展示名称映射
export const ROLE_MAP = {
    student: '学生',
    teacher: '教师',
    lf_admin: '失物招领管理员',
    sys_admin: '系统管理员'
}

// 是否为管理员（失物招领管理员或系统管理员）
export function isAdminRole(role) {
    return ADMIN_ROLES.includes(role)
}

// 角色名转展示文案
export function roleText(role) {
    return ROLE_MAP[role] || role || '未知'
}
