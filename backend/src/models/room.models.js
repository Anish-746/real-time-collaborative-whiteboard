import { supabase } from '../database/index.js';
import bcrypt from 'bcryptjs';

export class RoomModel {
  /**
   * Create a new room
   */
  static async create({ name, ownerId, accessType = 'public', password = null, maxUsers = 10, document = null }) {
    let passwordHash = null;
    
    // Hash password if access type is protected
    if (accessType === 'protected' && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }
    
    // Convert document to Buffer if it's a base64 string or handle existing Buffer
    let documentBuffer = null;
    if (document) {
      if (typeof document === 'string') {
        // Assume base64 encoded string
        documentBuffer = Buffer.from(document, 'base64');
      } else if (Buffer.isBuffer(document)) {
        documentBuffer = document;
      }
    }
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name,
        owner_id: ownerId,
        access_type: accessType,
        password_hash: passwordHash,
        max_users: maxUsers,
        is_active: true,
        document: documentBuffer
      })
      .select('id, name, short_code, owner_id, access_type, max_users, is_active, document, created_at, updated_at')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Automatically add owner to room_users with owner permission
    await supabase
      .from('room_users')
      .insert({
        room_id: data.id,
        user_id: ownerId,
        permission_level: 'owner'
      });
    
    return data;
  }
  
  /**
   * Find room by ID
   */
  static async findById(roomId) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null;
    }
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Find room by short code
   */
  static async findByShortCode(shortCode) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('short_code', shortCode)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null;
    }
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Get all rooms for a user (as owner or member)
   */
  static async getUserRooms(userId) {
    const { data, error } = await supabase
      .from('room_users')
      .select(`
        permission_level,
        joined_at,
        rooms (
          id,
          name,
          short_code,
          owner_id,
          access_type,
          max_users,
          is_active,
          document,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      ...item.rooms,
      user_permission: item.permission_level,
      user_joined_at: item.joined_at
    }));
  }
  
  /**
   * Get all public rooms
   */
  static async getPublicRooms(limit = 50) {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, name, short_code, owner_id, access_type, max_users, created_at')
      .eq('access_type', 'public')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Add user to room
   */
  static async addUserToRoom(roomId, userId, permissionLevel = 'collaborator') {
    const { data, error } = await supabase
      .from('room_users')
      .insert({
        room_id: roomId,
        user_id: userId,
        permission_level: permissionLevel
      })
      .select()
      .single();
    
    if (error) {
      // User already in room
      if (error.code === '23505') {
        return null;
      }
      throw error;
    }
    
    return data;
  }
  
  /**
   * Check if user is in room
   */
  static async isUserInRoom(roomId, userId) {
    const { data, error } = await supabase
      .from('room_users')
      .select('permission_level')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null;
    }
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Get room member count
   */
  static async getRoomMemberCount(roomId) {
    const { count, error } = await supabase
      .from('room_users')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);
    
    if (error) {
      throw error;
    }
    
    return count;
  }
  
  /**
   * Verify room password
   */
  static async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }
  
  /**
   * Update room
   */
  static async update(roomId, updates) {
    // Convert document to Buffer if it's a base64 string
    if (updates.document) {
      if (typeof updates.document === 'string') {
        updates.document = Buffer.from(updates.document, 'base64');
      } else if (!Buffer.isBuffer(updates.document)) {
        delete updates.document; // Remove if invalid type
      }
    }
    
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select('id, name, short_code, owner_id, access_type, max_users, is_active, document, created_at, updated_at')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  /**
   * Delete room
   */
  static async delete(roomId) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);
    
    if (error) {
      throw error;
    }
    
    return true;
  }
  
  /**
   * Remove user from room
   */
  static async removeUserFromRoom(roomId, userId) {
    const { error } = await supabase
      .from('room_users')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return true;
  }
  
  /**
   * Get room members
   */
  static async getRoomMembers(roomId) {
    const { data, error } = await supabase
      .from('room_users')
      .select(`
        permission_level,
        joined_at,
        users (
          id,
          username,
          email,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('room_id', roomId);
    
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      ...item.users,
      permission_level: item.permission_level,
      joined_at: item.joined_at
    }));
  }
}
