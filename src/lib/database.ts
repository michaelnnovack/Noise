import { supabase } from './supabase';
import { Measurement, User } from '@/types';

export class DatabaseService {
  static async saveMeasurement(measurement: Omit<Measurement, 'id'>): Promise<Measurement | null> {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .insert({
          user_id: measurement.user_id,
          decibel_level: measurement.decibel_level,
          category: measurement.category,
          timestamp: measurement.timestamp.toISOString(),
          duration: measurement.duration
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        timestamp: new Date(data.timestamp)
      };
    } catch (error) {
      console.error('Error saving measurement:', error);
      return null;
    }
  }

  static async getMeasurements(userId: string, limit = 100): Promise<Measurement[]> {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return [];
    }
  }

  static async getMeasurementsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Measurement[]> {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error fetching measurements by date range:', error);
      return [];
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<Pick<User, 'custom_threshold'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        ...data,
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async createUserProfile(user: Omit<User, 'created_at'>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          custom_threshold: user.custom_threshold
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        created_at: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  static async exportUserData(userId: string): Promise<string> {
    try {
      const measurements = await this.getMeasurements(userId, 10000);
      
      const csvHeader = 'Timestamp,Decibel Level,Category,Duration\n';
      const csvRows = measurements.map(m => 
        `${m.timestamp.toISOString()},${m.decibel_level},${m.category},${m.duration || ''}`
      ).join('\n');
      
      return csvHeader + csvRows;
    } catch (error) {
      console.error('Error exporting user data:', error);
      return '';
    }
  }
}