FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
USER root
WORKDIR /app

# Create upload directory and fix ownership
RUN mkdir -p /app/wwwroot/uploads \
    && chown -R ${APP_UID}:${APP_UID} /app

# Drop privileges
USER ${APP_UID}

EXPOSE 8080
EXPOSE 8081

ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["CSPortfolioAPI/CSPortfolioAPI.csproj", "CSPortfolioAPI/"]
RUN dotnet restore "CSPortfolioAPI/CSPortfolioAPI.csproj"
COPY . .
WORKDIR "/src/CSPortfolioAPI"
RUN dotnet build "CSPortfolioAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "CSPortfolioAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CSPortfolioAPI.dll"]
