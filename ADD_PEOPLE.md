# Adding People to Samantha Birthday

## Quick Start

First, start the server:
```bash
npx nx serve samantha-birthday
```

## Add People via API

Now that email, phone, and address are optional, you only need name and date_of_birth.

### Add Barby Cochrane (mom)
```bash
curl -X POST http://localhost:3000/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Barby Cochrane",
    "date_of_birth": "YYYY-MM-DD"
  }'
```

### Add Bobbyee Archibald (sister)
```bash
curl -X POST http://localhost:3000/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bobbyee Archibald",
    "date_of_birth": "YYYY-MM-DD"
  }'
```

### Add Jordan Whare (brother)
```bash
curl -X POST http://localhost:3000/birthdays \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jordan Whare",
    "date_of_birth": "YYYY-MM-DD"
  }'
```

## Add Optional Information Later

You can update any person's information later by ID:

```bash
curl -X PUT http://localhost:3000/birthdays/{ID} \
  -H "Content-Type: application/json" \
  -d '{
    "email": "email@example.com",
    "phone": "+1-555-0123",
    "address": "123 Main St"
  }'
```

## View All Birthdays

```bash
curl http://localhost:3000/birthdays | jq .
```

## Notes

- Replace `YYYY-MM-DD` with actual dates (e.g., `1990-05-15`)
- All optional fields can be added later
- Only `name` and `date_of_birth` are required
