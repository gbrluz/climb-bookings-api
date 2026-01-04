import { Module, Global } from '@nestjs/common';
import { OneSignalService } from './push-notifications/onesignal.service';
import { WebSocketService } from './websocket/websocket.service';

@Global()
@Module({
  providers: [
    OneSignalService,
    WebSocketService,
    {
      provide: 'OneSignalService',
      useExisting: OneSignalService,
    },
    {
      provide: 'WebSocketService',
      useExisting: WebSocketService,
    },
  ],
  exports: [
    OneSignalService,
    WebSocketService,
    'OneSignalService',
    'WebSocketService',
  ],
})
export class MessagingModule {}
