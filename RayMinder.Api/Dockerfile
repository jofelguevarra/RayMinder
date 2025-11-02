# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj(s) and restore
COPY ["RayMinder.Api.csproj", "./"]
RUN dotnet restore "RayMinder.Api.csproj"

# copy everything else and publish
COPY . .
RUN dotnet publish "RayMinder.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# make sure app listens on port 5007
ENV ASPNETCORE_URLS=http://+:5007
COPY --from=build /app/publish .

EXPOSE 5007
ENTRYPOINT ["dotnet", "RayMinder.Api.dll"]
