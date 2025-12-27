// API Client for GearGuard Backend
export const DB = {
  async getAll(collection: string) {
    try {
      const response = await fetch(`/api/${collection}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      return [];
    }
  },

  async getById(collection: string, id: string) {
    try {
      const response = await fetch(`/api/${collection}?id=${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${collection} by id:`, error);
      return null;
    }
  },

  async create(collection: string, data: any) {
    try {
      const response = await fetch(`/api/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error creating ${collection}:`, error);
      throw error;
    }
  },

  async update(collection: string, data: any) {
    try {
      const response = await fetch(`/api/${collection}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      throw error;
    }
  },

  async delete(collection: string, id: string) {
    try {
      const response = await fetch(`/api/${collection}?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      throw error;
    }
  },
};