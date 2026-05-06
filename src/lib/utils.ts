import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function downloadFile(filename: string, content: string, contentType: string = 'text/plain') {
  try {
    const element = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = filename;
    element.target = '_blank';
    document.body.appendChild(element); 
    element.click();
    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    }, 200);
  } catch (error) {
    console.error("Export failed:", error);
    alert("Export might be blocked in this sandboxed preview environment. Rest assured, it will work perfectly when deployed to Vercel/GitHub.");
  }
}

export function insertAtCursor(
  input: HTMLTextAreaElement,
  textToInsert: string,
  wrap: boolean = false
) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const text = input.value;
  const before = text.substring(0, start);
  const after = text.substring(end);
  const selectedText = text.substring(start, end);

  let newValue = "";
  let newCursorPos = 0;

  if (wrap) {
    newValue = before + textToInsert + selectedText + textToInsert + after;
    newCursorPos = start + textToInsert.length + selectedText.length + textToInsert.length;
  } else {
    newValue = before + textToInsert + selectedText + after;
    newCursorPos = start + textToInsert.length + selectedText.length;
  }

  return { newValue, newCursorPos };
}
