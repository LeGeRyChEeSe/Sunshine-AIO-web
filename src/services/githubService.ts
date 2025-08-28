/**
 * GitHub API Service for fetching repository information
 * Handles version fetching with caching and error handling
 */

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
}

export interface CachedVersion {
  version: string;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class GitHubService {
  private readonly CACHE_KEY_SUNSHINE_AIO = 'sunshine_aio_version';
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly FALLBACK_VERSION = '1.0.0';
  
  private readonly SUNSHINE_AIO_REPO = 'LeGeRyChEeSe/Sunshine-AIO';
  private readonly GITHUB_API_BASE = 'https://api.github.com';

  /**
   * Fetches the latest tag version from GitHub API
   */
  private async fetchLatestTag(repo: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.GITHUB_API_BASE}/repos/${repo}/tags`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }

      const tags = await response.json();
      
      if (!tags || tags.length === 0) {
        throw new Error('No tags found');
      }

      // Get the first (latest) tag
      const latestTag = tags[0];
      return latestTag.name.replace(/^v/, ''); // Remove 'v' prefix if present
    } catch (error) {
      console.warn('Failed to fetch latest tag from GitHub:', error);
      throw error;
    }
  }

  /**
   * Gets cached version data from localStorage
   */
  private getCachedVersion(cacheKey: string): CachedVersion | null {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const data: CachedVersion = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp < data.ttl) {
        return data;
      }

      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.warn('Error reading from cache:', error);
      localStorage.removeItem(cacheKey);
      return null;
    }
  }

  /**
   * Caches version data to localStorage
   */
  private setCachedVersion(cacheKey: string, version: string): void {
    try {
      const data: CachedVersion = {
        version,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL,
      };
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Error writing to cache:', error);
    }
  }

  /**
   * Gets the latest Sunshine-AIO version with caching
   */
  public async getSunshineAIOVersion(): Promise<string> {
    // Try to get from cache first
    const cached = this.getCachedVersion(this.CACHE_KEY_SUNSHINE_AIO);
    if (cached) {
      return cached.version;
    }

    try {
      const version = await this.fetchLatestTag(this.SUNSHINE_AIO_REPO);
      this.setCachedVersion(this.CACHE_KEY_SUNSHINE_AIO, version);
      return version;
    } catch (error) {
      console.error('Failed to fetch Sunshine-AIO version:', error);
      return this.FALLBACK_VERSION;
    }
  }

  /**
   * Forces a refresh of the cached version
   */
  public async refreshSunshineAIOVersion(): Promise<string> {
    localStorage.removeItem(this.CACHE_KEY_SUNSHINE_AIO);
    return this.getSunshineAIOVersion();
  }

  /**
   * Gets the repository URL for Sunshine-AIO
   */
  public getSunshineAIORepoUrl(): string {
    return `https://github.com/${this.SUNSHINE_AIO_REPO}`;
  }

  /**
   * Gets the releases page URL for Sunshine-AIO
   */
  public getSunshineAIOReleasesUrl(): string {
    return `${this.getSunshineAIORepoUrl()}/releases`;
  }
}

// Export singleton instance
export const githubService = new GitHubService();