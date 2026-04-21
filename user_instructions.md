# User instructions

## I - Set up proper communication between back and front

### Back
Create a heroes and power application. Heroes and power wiil be stored in json files in .data folder at the root of the project. Feel free to add properties for heroes and powers according to your imagination.

- Use minimal apis
- Use records for requests / responses
- Use model for file
- Use mapper between models and requests / responses
- Be free about the architecture, but keep a clear separation of concerns (endpoints, configuration, services/business)
- Implement Get/GetAll/Create/Update/Delete
- Use abstraction and generic in the business logic to avoid boilerplate code

### Front

- Create screens : Heroes, heroe detail with power, Add heroe, Add power (mutualize with updates), implement delete options
- Feel free about the design, avoid too much boilerplate code
- Use HttpClient to communicate
- Use Signals stores to handle values and business logic
- Reduce to the minimum the code in components
- Use signals in components (no observable), for the form use reactive form (latest angular functionality)
- keep component / template / style separated

### Overall

- Use HTTP for now, remove https
- Don't create TU yes
- Create a global readme
- Remove unused code
- API should use api suffix
- configure a clear openapi endpoint to see the api description

## II - Set up docker + compose, development workflow

The aim of this section is deployment. I'd like 2 modes : a development mode && a release mode.

- For the back I want 2 dockerfiles, one development oriented and one release oriented. Both dockerfiles should run alma linux or rhel
- One docker file for the front in release mode (should run on same linux release as the one chosen for the back office)
- 2 composes : 
    - 1 for development containing only the build for the back office, settings necessary variables and mount json files. In development front will be serve simply running npm run start
    - 1 for release building both dockerfiles (front and back), a traefik will handle the necessary connection outside the network to the host
- use localhost:8008 for development
- use localhost:4208 for release