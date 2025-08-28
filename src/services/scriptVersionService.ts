/**
 * Script Version Service
 * Handles fetching the version from the local PowerShell script
 */

export class ScriptVersionService {
  private readonly SCRIPT_URL = '/script.ps1';
  private readonly FALLBACK_VERSION = '1.0.4';

  /**
   * Fetches the script version from the PowerShell script file
   */
  public async getScriptVersion(): Promise<string> {
    try {
      const response = await fetch(this.SCRIPT_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch script: ${response.status}`);
      }

      const scriptContent = await response.text();
      
      // Look for version in multiple formats:
      // # Version: 1.0.4
      // $script:ScriptVersion = "1.0.4"
      const versionPatterns = [
        /^#\s*Version:\s*([\d.]+)/m,
        /\$script:ScriptVersion\s*=\s*["']([\d.]+)["']/m,
        /Version:\s*([\d.]+)/m
      ];

      for (const pattern of versionPatterns) {
        const match = scriptContent.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      // If no version found, return fallback
      console.warn('Could not find version in script, using fallback');
      return this.FALLBACK_VERSION;
    } catch (error) {
      console.error('Error fetching script version:', error);
      return this.FALLBACK_VERSION;
    }
  }
}

// Export singleton instance
export const scriptVersionService = new ScriptVersionService();