export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // base64 string
}

export type BlockType = 'p' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'todo' | 'code' | 'quote' | 'divider';

export interface BlockData {
  id: string;
  type: BlockType;
  content: string;
  props?: any;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  blocks?: BlockData[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
  attachments: Record<string, Attachment>;
  isFavorite: boolean;
  fontStyle?: 'sans' | 'serif' | 'mono';
  smallText?: boolean;
  pageWidth?: 'standard' | 'full';
}
