# CS2 Portfolio
![img.png](Data/Img/img.png)
## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Dev Stack](#dev-stack)

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/Schleifinho/cs2-portfolio-v2.git
    ```
2. Navigate to the project directory:
    ```sh
    cd CSPortfolioV2
    ```
3. Docker Build
    ```sh
    docker compose build
    ```
4. Docker Run
    ```sh
    docker compose up -d
    ```

## Getting Started
On the initial run, make sure to load the provided items into db. `Data/DBDumps/items.sql`
Each Container can be configured via appsettings.json or compose.yaml

### csportfolioapi
- Core container
- Running on port 4000
- SwaggerUI => http://localhost:4000/swagger/index.html
### csportfolio-web-app
- Running on http://localhost:4040/
### rabbitmq
- Depends on MassTransit
- Handles events between Producers and Consumers
- Access: http://localhost:15672/#/ user: guest, pw: guest
### cspriceupdater
- Consumes price update events 
- Updates inventory prices every hour if "ENABLE_PRICE_REFRESH" is enabled
### csitemimporter
- Used to load CS2 Items into the database
- Generate files to import (*TBD*)

***Minimal containers to run: cs-db, csportfolioapi, masstransit-db, rabbitmq, redis***

## Dev Stack
- Docker
- PostgresDB (Timescale)
- RabbitMQ and Masstransit
- C# (dotnet9 & Entity FrameWork)
- React and Typescript

