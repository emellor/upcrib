// src/types/index.ts
export interface RoomType {
  id: string;
  name: string;
  type: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'other';
  width: number;
  height: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  x: number;
  y: number;
  rotation: number;
}

export interface DesignProject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  rooms: RoomType[];
  furniture: FurnitureItem[];
}
