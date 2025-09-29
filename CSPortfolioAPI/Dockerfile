FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
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
