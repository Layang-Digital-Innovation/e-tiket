# Sub-Events API Documentation

This document describes the API endpoints for managing sub-events in the ticketing system.

## Overview

Sub-events allow you to create hierarchical events where:
- If an event has no sub-events, ticketing applies to the main event
- If sub-events exist, ticketing can be handled individually for each sub-event
- Main event ticketing can be enabled/disabled when sub-events exist

## Event Entity Updates

### New Fields
- `hasSubEvents`: boolean - Indicates if the event has sub-events
- `enableMainEventTicketing`: boolean - Whether main event ticketing is allowed when sub-events exist
- `subEvents`: SubEvent[] - Array of sub-events (OneToMany relationship)

## Sub-Event Endpoints

### Create Sub-Event
```
POST /sub-events
Authorization: Bearer token (ORGANIZER or ADMIN)
```

**Request Body:**
```json
{
  "title": "Workshop Session 1",
  "description": "Introduction to Web Development",
  "location": "Room A",
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T12:00:00Z",
  "maxCapacity": 50,
  "imageUrl": "https://example.com/image.jpg",
  "status": "ACTIVE",
  "sortOrder": 1,
  "parentEventId": "uuid-of-parent-event"
}
```

### Get All Sub-Events
```
GET /sub-events
Authorization: Bearer token
```

### Get Sub-Events by Parent Event
```
GET /sub-events/by-parent/:parentEventId
Authorization: Bearer token
```

### Get Single Sub-Event
```
GET /sub-events/:id
Authorization: Bearer token
```

### Update Sub-Event
```
PATCH /sub-events/:id
Authorization: Bearer token (ORGANIZER or ADMIN)
```

### Delete Sub-Event
```
DELETE /sub-events/:id
Authorization: Bearer token (ORGANIZER or ADMIN)
```

### Update Sub-Events Sort Order
```
PATCH /sub-events/sort-order/:parentEventId
Authorization: Bearer token (ORGANIZER or ADMIN)
```

**Request Body:**
```json
{
  "subEventIds": ["uuid1", "uuid2", "uuid3"]
}
```

## Ticket Endpoints Updates

### Create Ticket for Sub-Event
```
POST /tickets
Authorization: Bearer token (ORGANIZER or ADMIN)
```

**Request Body:**
```json
{
  "name": "Workshop Ticket",
  "description": "Access to workshop session",
  "price": 25.00,
  "maxQuantity": 50,
  "type": "REGULAR",
  "status": "ACTIVE",
  "eventId": "uuid-of-parent-event",
  "subEventId": "uuid-of-sub-event"
}
```

### Get Tickets by Sub-Event
```
GET /tickets/sub-event/:subEventId
Authorization: Bearer token
```

### Get All Tickets for Event (including sub-events)
```
GET /tickets/event/:eventId/all
Authorization: Bearer token
```

### Get Main Event Tickets Only
```
GET /tickets/event/:eventId
Authorization: Bearer token
```

## Business Logic

### Event Creation
- When creating an event, `hasSubEvents` defaults to `false`
- `enableMainEventTicketing` defaults to `true`

### Sub-Event Creation
- Sub-event dates must be within parent event date range
- Sub-event start date must be before end date
- Parent event must exist

### Ticket Creation Logic

#### For Main Events:
- If event has no sub-events: tickets can be created normally
- If event has sub-events and `enableMainEventTicketing` is `true`: tickets can be created for main event
- If event has sub-events and `enableMainEventTicketing` is `false`: tickets cannot be created for main event

#### For Sub-Events:
- Parent event must have `hasSubEvents` set to `true`
- Sub-event must exist and belong to the specified parent event
- Ticket sale dates must be within sub-event date range

### Validation Rules

1. **Sub-Event Dates**: Must be within parent event date range
2. **Ticket Sale Dates**: Must be before the target event/sub-event start date
3. **Authorization**: Only event organizers and admins can manage sub-events
4. **Parent Event**: Must exist when creating sub-events
5. **Sort Order**: Must be unique within the same parent event

## Example Usage Scenarios

### Scenario 1: Conference with Sessions
```json
{
  "mainEvent": {
    "title": "Tech Conference 2024",
    "hasSubEvents": true,
    "enableMainEventTicketing": true
  },
  "subEvents": [
    {
      "title": "Keynote Session",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T10:00:00Z"
    },
    {
      "title": "Workshop A",
      "startDate": "2024-01-15T10:30:00Z",
      "endDate": "2024-01-15T12:00:00Z"
    }
  ]
}
```

### Scenario 2: Workshop Series (Sub-events only)
```json
{
  "mainEvent": {
    "title": "Web Development Bootcamp",
    "hasSubEvents": true,
    "enableMainEventTicketing": false
  },
  "subEvents": [
    {
      "title": "HTML & CSS Basics",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T12:00:00Z"
    },
    {
      "title": "JavaScript Fundamentals",
      "startDate": "2024-01-16T09:00:00Z",
      "endDate": "2024-01-16T12:00:00Z"
    }
  ]
}
```

## Error Responses

### Common Error Codes
- `400 Bad Request`: Invalid data or business logic violation
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found

### Example Error Response
```json
{
  "statusCode": 400,
  "message": "Sub-event dates must be within parent event date range",
  "error": "Bad Request"
}
```