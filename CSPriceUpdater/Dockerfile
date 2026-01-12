# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution files
COPY . .

# Copy NuGet config
COPY NuGet.config ./

# Restore all projects
RUN dotnet restore "CSPriceUpdater/CSPriceUpdater.csproj"

# Build and publish
WORKDIR "/src/CSPriceUpdater"
RUN dotnet publish "CSPriceUpdater.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Optional: non-root user
# RUN useradd -m appuser
# USER appuser

ENTRYPOINT ["dotnet", "CSPriceUpdater.dll"]
