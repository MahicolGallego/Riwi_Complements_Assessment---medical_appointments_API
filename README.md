<p align="center">
  <img src="https://th.bing.com/th/id/R.04e00ea7a37191a8ffeb15aae067bfd2?rik=aTJY0kAnBJmHNQ&pid=ImgRaw&r=0" width="70%" />
</p>

# Riwi Complements Assessment

## Description

Api for scheduling appointments

### Solution development

It includes user registration and login for both patients and doctors, with authentication handled through JWT and Passport strategies. The API features role-based access to routes and information, allowing patients and doctors to interact with the system according to their roles. Doctors can register their availability schedules, while patients can view and filter available slots by specialist type and date. Patients can also schedule, view, cancel, and reschedule appointments, while doctors can manage their appointments, update their status, and provide feedback notes. Additionally, the API includes an automated scheduled task that runs every hour to check for expired availability slots that were not taken and disables them.

## Running the Project

### Prerequisites

Before running the NestJS project, ensure you have the following installed on your system:

- **Node.js**:

  - Version: v14.x or higher (recommended: LTS version)
  - Download from: [Node.js Official Website](https://nodejs.org/)

- **npm (Node Package Manager)**:

  - npm comes bundled with Node.js.

- **Git**:

  - For version control and repository management.
  - Install Git from: [Git Official Website](https://git-scm.com/)

- **Postman or cURL** (optional):

  - For testing API endpoints easily.
  - Download Postman from: [Postman Official Website](https://www.postman.com/)

### Create Database

Create a PostgreSQL database with a service provider. You can use the same one utilized in the project's creation: Aiven Cloud [Clever Cloud](https://api.clever-cloud.com/).

With the provided connection URI, set up your environment variables:

- Based on the `.env.template` file found in the root of the project, create a `.env` file in the root directory of the project.

- Copy and paste the content of `.env.template` into the newly created `.env` file.

- Assign the appropriate values according to the URI or variables provided by your selected service provider.

# Project Setup

### Open Terminal in Project Directory

## Install Dependencies

To install the project dependencies, run the following command:

```bash
npm i
```

## Run the Project

To start the project in development mode, use:

```bash
npm run start:dev
```

## The API is running correctly, you can now interact with it

## Documentation

Once the project is running successfully, you can access the Swagger documentation for the API at:

[http://localhost:3000/medical-appointments/api/v1/docs](http://localhost:3000/medical-appointments/api/v1/docs)

## License

[MIT licensed](LICENSE).
