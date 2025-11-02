# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["RayMinder.Api.csproj", "./"]
RUN dotnet restore "RayMinder.Api.csproj"

# Copy everything else and publish
COPY . .
RUN dotnet publish "RayMinder.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Make sure app listens on port 5007
ENV ASPNETCORE_URLS=http://+:5007
COPY --from=build /app/publish .

EXPOSE 5007
ENTRYPOINT ["dotnet", "RayMinder.Api.dll"]
