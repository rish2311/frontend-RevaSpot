import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pascalCase(text?: string): string {
  return (
    text
      ?.split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || ''
  )
}

export function convertUTCToLocal(utcDateString: string) {
  // Parse the date string into a Date object
  const [day, month, year, time, period] = utcDateString.split(' ')
  const date = new Date(`${day} ${month} 20${year} ${time} ${period} UTC`)

  // Format the date to the local time zone
  return new Intl.DateTimeFormat(navigator.language, {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatNumber(totalCount: number): string {
  if (totalCount >= 1000000) {
    return (totalCount / 1000000).toFixed(1) + 'M'
  } else if (totalCount >= 1000) {
    return (totalCount / 1000).toFixed(1) + 'K'
  } else {
    return totalCount.toLocaleString()
  }
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024 // 1 KB = 1024 Bytes
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k)) // Determine the unit

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

export function formatUTCToIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';

  try {
    const utcDate = new Date(dateInput);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcDate.getTime() + istOffsetMs);

    return istDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch (error) {
    console.error('Invalid date passed to formatUTCToIST:', dateInput);
    return '-';
  }
}
