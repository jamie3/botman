# Samantha Birthday Service

A Fastify-based microservice for managing birthday data with automated notification capabilities.

## Overview

Samantha consists of two components:
1. **REST API** - Manages birthday data (CRUD operations)
2. **Cron Job** - Automated daily birthday checks and notifications

See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for details on how Samantha operates and what she does when running.

## Architecture

Built as a Fastify microservice following the monorepo architecture:
- **REST API** (always running) - Manages birthday data, provides health endpoint
- **Cron Job** (daily execution) - Checks birthdays and sends notifications
- **Data Storage** - JSON file persistence (`./data/birthdays.json`)

## Data Model

Each birthday entry contains:

**Required:**
- `name` - Person's full name
- `date_of_birth` - Birth date in YYYY-MM-DD format

**Optional:**
- `nickname` - What you call them (e.g., "Mom", "Sis", "Bobby")
- `relationship` - Your relationship to them (e.g., "Mother", "Sister", "Friend", "Brother")
- `interests` - Their hobbies and interests (helps with gift ideas)
- `email` - Email address
- `phone` - Phone number
- `address` - Physical address

## Quick Start

### Development

```bash
# Start the API server
npx nx serve samantha-birthday

# Server will be available at http://localhost:3000
```

### Production (Docker)

```bash
# Build the application
npx nx build samantha-birthday

# Run with Docker Compose
docker-compose up -d samantha-birthday

# View logs
docker-compose logs -f samantha-birthday
```

## API Reference

### Health Check
```bash
GET /health
```
Returns service health status.

**Response:**
```json
{
  "status": "ok",
  "service": "samantha-birthday"
}
```

### Get All Birthdays
```bash
GET /birthdays
```

**Response:**
```json
{
  "birthdays": [
    {
      "id": "uuid",
      "name": "John Doe",
      "nickname": "Johnny",
      "date_of_birth": "1990-05-15",
      "relationship": "Friend",
      "interests": "golf, photography",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "address": "123 Main St"
    }
  ]
}
```

### Get Birthday by ID
```bash
GET /birthdays/:id
```

### Get Upcoming Birthdays
```bash
GET /birthdays/upcoming?days=14
```

Query parameters:
- `days` - Number of days to look ahead (default: 30)

### Create Birthday
```bash
POST /birthdays
Content-Type: application/json

{
  "name": "John Doe",
  "date_of_birth": "1990-05-15",
  "nickname": "Johnny",                      // optional
  "relationship": "Friend",                  // optional
  "interests": "golf, photography, hiking",  // optional
  "email": "john@example.com",               // optional
  "phone": "+1-555-0123",                    // optional
  "address": "123 Main St"                   // optional
}
```

**Response:** 201 Created

### Update Birthday
```bash
PUT /birthdays/:id
Content-Type: application/json

{
  "phone": "+1-555-9999",
  "interests": "golf, cooking"
}
```

All fields are optional (partial update).

### Delete Birthday
```bash
DELETE /birthdays/:id
```

**Response:** 204 No Content

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | localhost |
| `PORT` | Server port | 3000 |
| `DATA_DIR` | Data storage directory | ./data |
| `CRON_SCHEDULE` | Cron schedule for checks | "0 9 * * *" (9 AM daily) |
| `NOTIFICATION_DAYS` | Days in advance to notify | 14 |
| `SIGNAL_CLI_PATH` | Path to signal-cli executable | - |
| `SIGNAL_PHONE_NUMBER` | Signal sender number | - |
| `SIGNAL_RECIPIENT` | Signal recipient number | - |

## Project Structure

```
apps/samantha-birthday/
├── src/
│   ├── main.ts                    # API server entry point
│   ├── cron.ts                    # Cron job entry point (to be implemented)
│   └── app/
│       ├── types/
│       │   └── birthday.ts        # Type definitions
│       ├── services/
│       │   ├── storage.ts         # Birthday storage service
│       │   └── notifier.ts        # Signal notification (to be implemented)
│       ├── plugins/
│       │   ├── storage.ts         # Storage plugin
│       │   └── sensible.ts        # HTTP error handling
│       └── routes/
│           ├── root.ts            # Health check
│           └── birthdays.ts       # Birthday CRUD endpoints
├── Dockerfile
├── README.md                      # This file (technical documentation)
└── INSTRUCTIONS.md                # Samantha's job instructions (behavioral)
```

## Data Storage

- Format: JSON
- Location: `./data/birthdays.json` (configurable via `DATA_DIR`)
- Auto-created on first run
- Persistent across container restarts (via Docker volumes)

## Testing

### Manual API Testing
```bash
# Check upcoming birthdays
curl http://localhost:3000/birthdays/upcoming?days=14

# Create a test birthday
curl -X POST http://localhost:3000/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Person",
    "date_of_birth": "1990-01-01"
  }'
```

### Test Script
A comprehensive test script is available:
```bash
./test-birthdays.sh
```

## Adding People

See [ADD_PEOPLE.md](../../ADD_PEOPLE.md) for quick instructions on adding people to the birthday list.

## Behavioral Instructions

See [INSTRUCTIONS.md](./INSTRUCTIONS.md) for details on:
- How Samantha operates
- Notification formats and timing
- Personalization guidelines
- Error handling procedures
- Samantha's personality and goals

## Future Enhancements

- [ ] Implement cron job worker
- [ ] Integrate Signal messenger
- [ ] Add email notifications as backup
- [ ] Support multiple notification recipients
- [ ] Gift suggestion features based on interests
- [ ] Notification history tracking
- [ ] Snooze/postpone notifications
- [ ] Web UI for managing birthdays
