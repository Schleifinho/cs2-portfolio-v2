# -------------------------
# Base runtime
# -------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# -------------------------
# Build
# -------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# ---- Copy central package management first (cache key) ----
COPY Directory.Packages.props .
COPY NuGet.config .     
# Copy local NuGet packages
COPY LocalNuGets/ LocalNuGets/ 

# ---- Copy project files first (restore cache) ----
COPY CSPortfolioAPI/CSPortfolioAPI.csproj CSPortfolioAPI/
COPY CSPortfolioLib/CSPortfolioLib.csproj CSPortfolioLib/

# ---- Restore (Docker sees central props now) ----
RUN dotnet restore CSPortfolioAPI/CSPortfolioAPI.csproj

# ---- Copy full source ----
COPY . .

WORKDIR /src/CSPortfolioAPI
RUN dotnet build CSPortfolioAPI.csproj -c $BUILD_CONFIGURATION -o /app/build

# -------------------------
# Publish
# -------------------------
FROM build AS publish
RUN dotnet publish CSPortfolioAPI.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# -------------------------
# Runtime
# -------------------------
FROM base AS final
WORKDIR /app
RUN mkdir -p /app/wwwroot/uploads
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CSPortfolioAPI.dll"]
