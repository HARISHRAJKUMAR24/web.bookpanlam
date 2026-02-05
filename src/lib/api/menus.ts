// lib/api/menus.ts
export interface MenuType {
  id: number;
  name: string;
  items: number;
}

export async function getMenus(): Promise<MenuType[]> {
  try {
    const response = await fetch('/api/menus/get.php');
    if (!response.ok) throw new Error('Failed to fetch menus');
    const data = await response.json();
    
    // Transform the data to match MenuType interface
    return data.map((menu: any) => ({
      id: menu.id,
      name: menu.name,
      items: menu.item_count || 0
    }));
  } catch (error) {
    console.error('Error fetching menus:', error);
    return [];
  }
}

export async function addMenu(name: string): Promise<{ success: boolean; id?: number; name?: string; message?: string }> {
  try {
    const response = await fetch('/api/menus/add.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add menu');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding menu:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to add menu' 
    };
  }
}

export async function updateMenu(id: number, name: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/menus/update.php', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, name }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update menu');
    }
    
    return result;
  } catch (error) {
    console.error('Error updating menu:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update menu' 
    };
  }
}

export async function deleteMenu(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/menus/delete.php', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete menu');
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting menu:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to delete menu' 
    };
  }
}