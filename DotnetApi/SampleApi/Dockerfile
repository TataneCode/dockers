FROM almalinux:9 AS build

RUN dnf install -y https://packages.microsoft.com/config/rhel/9/packages-microsoft-prod.rpm \
    && dnf install -y dotnet-sdk-10.0 \
    && dnf clean all

WORKDIR /src
COPY . .
RUN dotnet publish SampleApi/SampleApi.csproj -c Release -o /publish

FROM almalinux:9-minimal AS runtime

RUN printf '[packages-microsoft-com-prod]\nname=packages-microsoft-com-prod\nbaseurl=https://packages.microsoft.com/rhel/9/prod/\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc\n' \
    > /etc/yum.repos.d/microsoft-prod.repo \
    && microdnf install -y aspnetcore-runtime-10.0 \
    && microdnf clean all

WORKDIR /app
COPY --from=build /publish .

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5025

EXPOSE 5025

ENTRYPOINT ["dotnet", "SampleApi.dll"]
