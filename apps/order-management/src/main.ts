import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { OrderManagementModule } from './order-management.module';

async function bootstrap() {
  const app = await NestFactory.create(OrderManagementModule);

  function createMicroserviceOptions(
    queueName: string,
    durable: boolean,
    noAck: boolean,
  ): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq:5672'],
        queue: queueName,
        noAck,
        queueOptions: {
          durable: durable,
        },
      },
    };
  }

  // Queue Retains all messages until explicit ACK
  const orderWorkerQueueOptions = createMicroserviceOptions(
    'order-worker-queue',
    true,
    false,
  );
  app.connectMicroservice(orderWorkerQueueOptions); //

  // Request/Response Queue
  const orderRequestQueueOptions = createMicroserviceOptions(
    'order-request-queue',
    false,
    true,
  );
  app.connectMicroservice(orderRequestQueueOptions); //

  await app.startAllMicroservices();
  await app.listen(3001);

  console.log('Order Management Microservice is listening');
}

bootstrap();
