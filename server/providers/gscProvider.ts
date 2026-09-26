/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GscProviderStatus {
  status: 'configured' | 'not_configured';
  configured: boolean;
  provider: string;
  clientId: string | null;
  scope: string;
  supportUrlInspection: boolean;
  message: string;
}

export interface GoogleSearchConsoleProvider {
  name: string;
  isConfigured: () => boolean;
  getStatus: () => GscProviderStatus;
}

export class GoogleSearchConsoleAdapter implements GoogleSearchConsoleProvider {
  name = 'Google Search Console';

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim().length > 0);
  }

  getStatus(): GscProviderStatus {
    const configured = this.isConfigured();
    return {
      status: configured ? 'configured' : 'not_configured',
      configured,
      provider: this.name,
      clientId: configured ? process.env.GOOGLE_CLIENT_ID! : null,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      supportUrlInspection: true,
      message: configured
        ? 'Search Console OAuth Client đã được định cấu hình'
        : 'Chưa kết nối Search Console. Cấu hình GOOGLE_CLIENT_ID để kích hoạt xác thực OAuth trực tiếp.',
    };
  }
}

export const activeGscProvider = new GoogleSearchConsoleAdapter();
