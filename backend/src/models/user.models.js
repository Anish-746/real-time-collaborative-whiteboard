import { supabase } from '../database/index.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

export class UserModel {
  static async create(userData) {
    const { username, email, password, firstName, lastName } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName
      })
      .select('id, username, email, first_name, last_name, is_active, created_at')
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, first_name, last_name, avatar, is_active, last_login, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateLastLogin(id) {
    const { data, error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async softDelete(id) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export { supabase };