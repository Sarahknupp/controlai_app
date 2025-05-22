import axios from 'axios';
import { ICustomer } from '../types/customer';
import { handleApiError } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CustomerQueryParams {
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class CustomerService {
  async getCustomers(params: CustomerQueryParams = {}) {
    try {
      const response = await axios.get(`${API_URL}/customers`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getCustomer(id: string) {
    try {
      const response = await axios.get(`${API_URL}/customers/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createCustomer(customer: Partial<ICustomer>) {
    try {
      const response = await axios.post(`${API_URL}/customers`, customer);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateCustomer(id: string, customer: Partial<ICustomer>) {
    try {
      const response = await axios.put(`${API_URL}/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async deleteCustomer(id: string) {
    try {
      const response = await axios.delete(`${API_URL}/customers/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const customerService = new CustomerService(); 