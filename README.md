# Case Study

# How to run it

### System Requirements

- Node 20.18.1
- Yarn 1.22.22
- Docker 27.4.0

### Install

From the root directory, run:

```
yarn install
```

### Running the apps

Start up docker containers

```
docker compose up
```

- You will see logs in the console grouped by each docker service. I added some logs to show different parts of the order flow.

## System Artchitecture and Thought Process

I wanted those `Bonus Points` so I chose NestJS (I never used it before until this case study). It felt very familiar given my experience working a lot with Angular 2+ in the past.

### NestJS apps:

- order-management-api-gateway
  - REST API
- order-management

  - MICROSERVICE

- RabbitMQ is used for messaging.

### RabbitMQ

I choose to use rabbitmq and 2 different queues for local development:

- order-worker-queue
  - Anything using this queue, persists all messages and will replay messages to consumers if not properly ACKed
  - For mission critical messages that cannot disappear and be left unhandled.
- order-request-queue
  - Handles requests from the REST api
    - get orders
    - get single order

```typescript
export const Subjects = {
  OrderWorkerQueue: {
    Create: 'orders.create',
    ProcessPayment: 'orders.process.payment',
    Ship: 'orders.ship',
    Update: 'orders.update',
    UpateStatus: 'orders.update.status',
    Delete: 'orders.delete',
    Cancel: 'orders.cancel',
    Delivered: 'orders.delivered',
  },
  OrderRequestQueue: {
    GetAll: 'orders.getAll',
    FindOne: 'orders.findOne',
  },
} as const;
```

#### Messaging

- Sometimes messages are sent from the api-gatweway -> rabbitmq -> microservice.
- Sometimes messages are sent from the microservice -> rabbitmq -> microservice.

### Result pattern

In the microservice I chose to use a result pattern where the services never 'throw errors', but return a result with a status. If the status was SUCCESS, it would return a value prop associated with the success. If the status was FAILURE, it would return an error prop associated with a failed scenario.

### Soft deletes

When deleting an order, we soft delete the item by setting isDeleted to true on the order.

# Known limitations with this implementation & Future Work

- I realized towards the end of developing this, I only accepted one product per order (I wish I noticied this sooner).
  - Given more time I would supports orders having an array of products each with their own quantity.
- There is some 'proof of concept' code that needs to be cleaned up and removed from the codebase.
- Not all messages in the microservice have guards on user input
- This is mainly a `happy path` implemenation. We would need to add robust error handling around all parts of this critical order flow.
- There is no persistence database for orders (stored only in memory in the microservice)
- Create microservices for other services such as:
  - customer
  - user
  - inventory
  - shipping
  - Notifcation
  - Analytics / Monitoring
- Not using any environment variables for connection strings and sensitive info and common variables
- RabbitMQ doesn't require any auth
- REST APIs are not protected
- Add decorators around methods to do logging
- I ignored some linting issues on purpose. Would not want to do that in a PROD app.
- Given I am new to NestJS, I am sure there are some other good patterns I didn't take advantage of.
- Shipping

  - For this demo, I assumed we handled 'setting up' shipping internally. I provided an API for the 3rd party shipping company where they could tell us when it was delivered. Ideally shipping would be its own microservice and support more nuanced shipping use cases and complexities.
  - If given more time, I would probably expand upon to this concept and let 3rd parties update 'shipping related' status updates

- Unit tests / e2e tests should be written.
- If you cancel/delete an order, and the order is still early on in the flow, the cancel/delete will be overriden and continue along the flow. We would want to account for this.
- If you delete an order, it should also change status to canced (currently doesn't do this).

# Infrastructure and Deployment

## Infra

- EKS (Kubernetes) for deploying the api-gateway and microservice and Kubernetes HPA (Horizontal Pod Autoscaler)
- Message Queue: Amazon SQS with FIFO + Dead Letter Queue (DLQ). I only chose rabbitmq for the case study for demo purposes.
- Aurora PostgreSQL / RDS
  - Relational DB to store order information
- API Gateway + ALB
  - Expose the system to the world. The api gateway points to the AWS Load Balancer
  - The load balancer routes traffic to multiple instances of the app pods

## Deployment

- Use github actions for automated testing and quality checks
  - Ensure all unit tests pass
  - Code coverage is above 80%
  - Linting
- Github actions to build docker images for api-gateway and microservice apps
  - leverage variables and secrets in github actions as needed
  - Automatically tag each new build and increment version numbers accordingly
- Automatically release new builds to a DEV/TEST/STAGING environment automatically
- PROD deploys would require a manually process / approvals
