import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { AuditService } from './audit.service';
import { AuditAction, EntityType } from '../types/audit';
import { UserRole } from './user.service';

export type Permission = 
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'roles.view'
  | 'roles.create'
  | 'roles.edit'
  | 'roles.delete'
  | 'customers.view'
  | 'customers.create'
  | 'customers.edit'
  | 'customers.delete'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'orders.view'
  | 'orders.create'
  | 'orders.edit'
  | 'orders.delete'
  | 'payments.view'
  | 'payments.create'
  | 'payments.edit'
  | 'payments.delete'
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.edit'
  | 'inventory.delete'
  | 'reports.view'
  | 'reports.create'
  | 'reports.edit'
  | 'reports.delete'
  | 'settings.view'
  | 'settings.edit'
  | 'audit.view';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  name: UserRole;
  description: string;
  permissions: Permission[];
  metadata?: Record<string, any>;
}

export interface UpdateRoleDto {
  description?: string;
  permissions?: Permission[];
  metadata?: Record<string, any>;
}

export class RoleService {
  private roles: Map<string, Role>;
  private auditService: AuditService;

  constructor() {
    this.roles = new Map();
    this.auditService = new AuditService();
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles() {
    const defaultRoles: Role[] = [
      {
        id: uuidv4(),
        name: 'ADMIN',
        description: 'Administrador do sistema com acesso total',
        permissions: [
          'users.view', 'users.create', 'users.edit', 'users.delete',
          'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
          'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
          'products.view', 'products.create', 'products.edit', 'products.delete',
          'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
          'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
          'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
          'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
          'settings.view', 'settings.edit',
          'audit.view'
        ],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'MANAGER',
        description: 'Gerente com acesso a operações e relatórios',
        permissions: [
          'customers.view', 'customers.create', 'customers.edit',
          'products.view', 'products.create', 'products.edit',
          'orders.view', 'orders.create', 'orders.edit',
          'payments.view', 'payments.create', 'payments.edit',
          'inventory.view', 'inventory.create', 'inventory.edit',
          'reports.view', 'reports.create',
          'settings.view'
        ],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'OPERATOR',
        description: 'Operador com acesso a operações básicas',
        permissions: [
          'customers.view', 'customers.create',
          'products.view',
          'orders.view', 'orders.create',
          'payments.view', 'payments.create',
          'inventory.view', 'inventory.create'
        ],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'VIEWER',
        description: 'Visualizador com acesso somente leitura',
        permissions: [
          'customers.view',
          'products.view',
          'orders.view',
          'payments.view',
          'inventory.view',
          'reports.view'
        ],
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  async createRole(dto: CreateRoleDto, createdBy: string): Promise<Role> {
    try {
      // Check if role name already exists
      const existingRole = Array.from(this.roles.values()).find(r => r.name === dto.name);
      if (existingRole) {
        throw new Error(`Role with name ${dto.name} already exists`);
      }

      const role: Role = {
        id: uuidv4(),
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
        isSystem: false,
        metadata: dto.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.roles.set(role.id, role);

      // Log the creation
      await this.auditService.logAction({
        action: AuditAction.CREATE,
        entityType: EntityType.USER,
        entityId: role.id,
        userId: createdBy,
        details: `Created role: ${role.name}`,
        status: 'success'
      });

      return role;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, dto: UpdateRoleDto, updatedBy: string): Promise<Role> {
    try {
      const role = this.roles.get(id);
      if (!role) {
        throw new Error(`Role not found: ${id}`);
      }

      if (role.isSystem) {
        throw new Error('Cannot modify system role');
      }

      const previousState = { ...role };

      // Update role fields
      if (dto.description) role.description = dto.description;
      if (dto.permissions) role.permissions = dto.permissions;
      if (dto.metadata) role.metadata = { ...role.metadata, ...dto.metadata };

      role.updatedAt = new Date();

      this.roles.set(id, role);

      // Log the update
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: role.id,
        userId: updatedBy,
        details: `Updated role: ${role.name}`,
        status: 'success'
      });

      return role;
    } catch (error) {
      logger.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: string, deletedBy: string): Promise<void> {
    try {
      const role = this.roles.get(id);
      if (!role) {
        throw new Error(`Role not found: ${id}`);
      }

      if (role.isSystem) {
        throw new Error('Cannot delete system role');
      }

      this.roles.delete(id);

      // Log the deletion
      await this.auditService.logAction({
        action: AuditAction.DELETE,
        entityType: EntityType.USER,
        entityId: id,
        userId: deletedBy,
        details: `Deleted role: ${role.name}`,
        status: 'success'
      });
    } catch (error) {
      logger.error('Error deleting role:', error);
      throw error;
    }
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRoleByName(name: UserRole): Promise<Role | undefined> {
    return Array.from(this.roles.values()).find(r => r.name === name);
  }

  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async hasPermission(roleName: UserRole, permission: Permission): Promise<boolean> {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      return false;
    }

    return role.permissions.includes(permission);
  }

  async validatePermissions(roleName: UserRole, requiredPermissions: Permission[]): Promise<boolean> {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      return false;
    }

    return requiredPermissions.every(permission => role.permissions.includes(permission));
  }

  async getRolePermissions(roleName: UserRole): Promise<Permission[]> {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    return role.permissions;
  }

  async addPermission(roleName: UserRole, permission: Permission, updatedBy: string): Promise<Role> {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    if (role.isSystem) {
      throw new Error('Cannot modify system role permissions');
    }

    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      role.updatedAt = new Date();
      this.roles.set(role.id, role);

      // Log the permission addition
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: role.id,
        userId: updatedBy,
        details: `Added permission ${permission} to role ${role.name}`,
        status: 'success'
      });
    }

    return role;
  }

  async removePermission(roleName: UserRole, permission: Permission, updatedBy: string): Promise<Role> {
    const role = await this.getRoleByName(roleName);
    if (!role) {
      throw new Error(`Role not found: ${roleName}`);
    }

    if (role.isSystem) {
      throw new Error('Cannot modify system role permissions');
    }

    const permissionIndex = role.permissions.indexOf(permission);
    if (permissionIndex !== -1) {
      role.permissions.splice(permissionIndex, 1);
      role.updatedAt = new Date();
      this.roles.set(role.id, role);

      // Log the permission removal
      await this.auditService.logAction({
        action: AuditAction.UPDATE,
        entityType: EntityType.USER,
        entityId: role.id,
        userId: updatedBy,
        details: `Removed permission ${permission} from role ${role.name}`,
        status: 'success'
      });
    }

    return role;
  }
} 