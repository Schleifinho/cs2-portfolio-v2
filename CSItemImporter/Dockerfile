# Use SDK to build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["CSItemImporter/CSItemImporter.csproj", "CSItemImporter/"]
RUN dotnet restore "CSItemImporter/CSItemImporter.csproj"

# Copy all source files
COPY . .
WORKDIR "/src/CSItemImporter"

# Build and publish
RUN dotnet publish "CSItemImporter.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/runtime:9.0 AS final
WORKDIR /app

# Optional: create a non-root user
ARG APP_UID=1000
RUN useradd -m -u $APP_UID appuser
USER appuser

# Copy published app
COPY --from=build /app/publish ./

ENTRYPOINT ["dotnet", "CSItemImporter.dll"]
