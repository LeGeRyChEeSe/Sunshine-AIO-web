/**
 * Version utilities for the application
 * Handles local script and web app version management
 */

import { githubService } from '../services/githubService';
import { scriptVersionService } from '../services/scriptVersionService';

/**
 * Gets the current web application version from package.json
 */
export const getWebVersion = (): string => {
  // In Vite, we can access package.json version through import.meta.env
  return import.meta.env.VITE_APP_VERSION || '1.0.4';
};

/**
 * Gets the current PowerShell script version
 * Dynamically reads from the actual script.ps1 file
 */
export const getScriptVersion = async (): Promise<string> => {
  try {
    return await scriptVersionService.getScriptVersion();
  } catch (error) {
    console.error('Failed to get script version:', error);
    return '1.0.4'; // Fallback version
  }
};

/**
 * Gets the latest Sunshine-AIO tool version from GitHub
 */
export const getSunshineAIOVersion = async (): Promise<string> => {
  try {
    return await githubService.getSunshineAIOVersion();
  } catch (error) {
    console.error('Failed to get Sunshine-AIO version:', error);
    return '1.0.0'; // Fallback version
  }
};

/**
 * Formats version string for display
 */
export const formatVersion = (version: string, prefix: string = 'v'): string => {
  if (version.startsWith('v') || version.startsWith('V')) {
    return version;
  }
  return `${prefix}${version}`;
};

/**
 * Compares two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
export const compareVersions = (v1: string, v2: string): number => {
  const normalize = (v: string) => v.replace(/^v/i, '').split('.').map(Number);
  const parts1 = normalize(v1);
  const parts2 = normalize(v2);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
};

/**
 * Version information object
 */
export interface VersionInfo {
  webVersion: string;
  scriptVersion: string;
  sunshineAIOVersion: string;
}

/**
 * Gets all version information
 */
export const getAllVersions = async (): Promise<VersionInfo> => {
  const [scriptVersion, sunshineAIOVersion] = await Promise.all([
    getScriptVersion(),
    getSunshineAIOVersion(),
  ]);

  return {
    webVersion: getWebVersion(),
    scriptVersion,
    sunshineAIOVersion,
  };
};