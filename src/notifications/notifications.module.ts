import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

@Global() // Opcional: Torna o serviço disponível em todo o app sem precisar re-importar
@Module({
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway], // Essencial para que outros módulos o vejam
})
export class NotificationsModule {}