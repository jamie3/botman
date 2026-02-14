This defines the architecture for this mono repo.

In the apps folder are a set of micro-services that run in docker and interact with each other.

## App Design

### Back End Apps

- All apps should be build using fastify.
- Requests will be parsed using zod and will return 400 if an error occurs
- Responses will be 
- Each will have a /health endpoint that is exposed
- Back end (headless) apps will serve from port 8080, 8081, etc...

### Zod

- Zod will be used for the types in the 
- Contracts between services should be in a libs/shared/types/services project
- Common schemas should be stored in a libs/shared/types/common

## Front End Apps

- All front end apps will be built in Nuxt 4

### Docker

- Each app has its own Docekrfile. It should be hardened so no one can have ssh/remote access.
- All the apps can be started via a docker compose file in the root folder of the mono repo.

## Constraints

- Apps cannot talk to each other unless I explicitly allow them.
