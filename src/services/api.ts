export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy-8C__M8MfzRCuvPnbdsjoiyOyllySz0JBiZUxsXCHTsMMIcyJuKg9iSwCqGUAdTCQQ/exec';

export interface StudentCourseResponse {
  kelas_uids: string[];
  kursus_uids: string[];
  progress: Record<string, number>; // courseUid -> level
}

export interface RoleDataResponse {
  kelas_uids: string[];
  progress: Record<string, Record<string, number>>; // studentUid -> { courseUid -> level }
}

export async function getStudentCourse(uid: string): Promise<StudentCourseResponse | undefined> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'getStudentCourse',
        uid,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student course:', error);
    return undefined;
  }
}

export async function getRoleData(uid: string): Promise<RoleDataResponse | undefined> {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'getRoleData',
        uid,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching role data:', error);
    return undefined;
  }
}

export async function updateProgress(uid: string, kursus_uid: string, level: number): Promise<void> {
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Often needed for Google Apps Script simple triggers if not returning JSON or if CORS issues arise
      body: JSON.stringify({
        action: 'updateProgress',
        uid,
        kursus_uid,
        level,
      }),
    });
  } catch (error) {
    console.error('Error updating progress:', error);
  }
}
