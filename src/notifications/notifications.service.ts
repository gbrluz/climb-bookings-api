import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;
  private readonly ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

  async sendPushToCityAndCategory(city: string, category: string, title: string, message: string) {
    const notificationData = {
      app_id: this.ONESIGNAL_APP_ID,
      headings: { en: title, pt: title },
      contents: { en: message, pt: message },
      // Filtros: Envia apenas para jogadores daquela cidade e categoria específica
      filters: [
        { field: 'tag', key: 'city', relation: '=', value: city },
        { operator: 'AND' },
        { field: 'tag', key: 'category', relation: '=', value: category }
      ],
    };

    return this.callOneSignal(notificationData);
  }

  async sendPushToClubOwners(city: string, title: string, message: string) {
    const notificationData = {
      app_id: this.ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      filters: [
        { field: 'tag', key: 'city', relation: '=', value: city },
        { operator: 'AND' },
        { field: 'tag', key: 'user_type', relation: '=', value: 'club_owner' }
      ],
    };

    return this.callOneSignal(notificationData);
  }

  private async callOneSignal(data: any) {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Basic ${this.ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      throw new InternalServerErrorException('Failed to send push notification');
    }
  }
}