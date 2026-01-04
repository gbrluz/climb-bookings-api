import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type FilterCondition = {
  field: string;
  key?: string;
  relation?: string;
  value?: string;
};

type FilterOperator = {
  operator: string;
};

export interface PushNotificationOptions {
  title: string;
  message: string;
  filters?: Array<FilterCondition | FilterOperator>;
  data?: Record<string, any>;
}

@Injectable()
export class OneSignalService {
  private readonly apiKey: string;
  private readonly appId: string;
  private readonly apiUrl = 'https://onesignal.com/api/v1/notifications';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ONESIGNAL_API_KEY') || '';
    this.appId = this.configService.get<string>('ONESIGNAL_APP_ID') || '';

    if (!this.apiKey || !this.appId) {
      console.warn('⚠️  OneSignal credentials not configured');
    }
  }

  async sendNotification(options: PushNotificationOptions): Promise<any> {
    if (!this.apiKey || !this.appId) {
      console.warn('OneSignal not configured, skipping notification');
      return { success: false, message: 'OneSignal not configured' };
    }

    const notificationData = {
      app_id: this.appId,
      headings: { en: options.title, pt: options.title },
      contents: { en: options.message, pt: options.message },
      filters: options.filters || [],
      data: options.data || {},
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Basic ${this.apiKey}`,
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  async sendToCityAndCategory(
    city: string,
    category: string,
    title: string,
    message: string,
  ): Promise<any> {
    return this.sendNotification({
      title,
      message,
      filters: [
        { field: 'tag', key: 'city', relation: '=', value: city },
        { operator: 'AND' },
        { field: 'tag', key: 'category', relation: '=', value: category },
      ],
    });
  }

  async sendToClubOwners(city: string, title: string, message: string): Promise<any> {
    return this.sendNotification({
      title,
      message,
      filters: [
        { field: 'tag', key: 'city', relation: '=', value: city },
        { operator: 'AND' },
        { field: 'tag', key: 'user_type', relation: '=', value: 'club_owner' },
      ],
    });
  }

  async sendToUser(userId: string, title: string, message: string, data?: any): Promise<any> {
    return this.sendNotification({
      title,
      message,
      filters: [{ field: 'tag', key: 'user_id', relation: '=', value: userId }],
      data,
    });
  }
}
