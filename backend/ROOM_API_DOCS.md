# Room API Documentation

## Overview
This document describes the Room APIs for the collaborative whiteboard application. All room endpoints are **protected routes** that require authentication via JWT token.

## Authentication
All requests must include an `Authorization` header with a valid JWT access token:
```
Authorization: Bearer <your_access_token>
```

---

## API Endpoints

### 1. Create Room
**POST** `/api/rooms`

Create a new whiteboard room. The authenticated user automatically becomes the owner.

**Request Body:**
```json
{
  "name": "My Whiteboard Room",
  "accessType": "public",  // Options: "public", "private", "protected"
  "password": "optional-password",  // Required only for "protected" rooms
  "maxUsers": 10  // Optional, default is 10
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Room created successfully",
  "data": {
    "room": {
      "id": "uuid-here",
      "name": "My Whiteboard Room",
      "short_code": "ABC12345",  // Auto-generated 8-character code
      "owner_id": "user-uuid",
      "access_type": "public",
      "max_users": 10,
      "is_active": true,
      "created_at": "2026-02-06T10:00:00.000Z",
      "updated_at": "2026-02-06T10:00:00.000Z"
    }
  }
}
```

**Notes:**
- The `short_code` is automatically generated (8 random alphanumeric characters)
- For `protected` rooms, password must be at least 4 characters
- User is automatically added to `room_users` table with `owner` permission

---

### 2. Join Room
**POST** `/api/rooms/join`

Join an existing room using its short code.

**Request Body:**
```json
{
  "shortCode": "ABC12345",
  "password": "room-password"  // Required only for protected rooms
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully joined the room",
  "data": {
    "room": {
      "id": "uuid-here",
      "name": "My Whiteboard Room",
      "short_code": "ABC12345",
      "access_type": "public",
      "max_users": 10,
      "owner_id": "owner-uuid",
      "created_at": "2026-02-06T10:00:00.000Z"
    },
    "permission_level": "collaborator"
  }
}
```

**Possible Errors:**
- `404`: Room not found
- `403`: Room is full / Room is not active / Private room (need invitation)
- `401`: Incorrect password (for protected rooms)

**Notes:**
- Public rooms: Anyone can join
- Protected rooms: Requires correct password
- Private rooms: Cannot join (invitation-only, not yet implemented)
- If user is already a member, returns success with `already_member: true`

---

### 3. Get My Rooms
**GET** `/api/rooms/my-rooms`

Get all rooms the authenticated user is a member of (as owner or member).

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "uuid-here",
        "name": "My Room",
        "short_code": "ABC12345",
        "owner_id": "user-uuid",
        "access_type": "public",
        "max_users": 10,
        "is_active": true,
        "created_at": "2026-02-06T10:00:00.000Z",
        "updated_at": "2026-02-06T10:00:00.000Z",
        "user_permission": "owner",
        "user_joined_at": "2026-02-06T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 4. Get Public Rooms
**GET** `/api/rooms/public?limit=50`

Get a list of all active public rooms.

**Query Parameters:**
- `limit` (optional): Number of rooms to return (default: 50, max: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Public rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "uuid-here",
        "name": "Public Room 1",
        "short_code": "XYZ78901",
        "owner_id": "owner-uuid",
        "access_type": "public",
        "max_users": 10,
        "created_at": "2026-02-06T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 5. Get Room Details
**GET** `/api/rooms/:shortCode`

Get detailed information about a specific room.

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Room details retrieved successfully",
  "data": {
    "room": {
      "id": "uuid-here",
      "name": "My Room",
      "short_code": "ABC12345",
      "owner_id": "user-uuid",
      "access_type": "public",
      "max_users": 10,
      "is_active": true,
      "created_at": "2026-02-06T10:00:00.000Z",
      "updated_at": "2026-02-06T10:00:00.000Z"
    },
    "members": [
      {
        "id": "user-uuid",
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "avatar": null,
        "permission_level": "owner",
        "joined_at": "2026-02-06T10:00:00.000Z"
      }
    ],
    "member_count": 1,
    "user_permission": "owner",
    "is_member": true
  }
}
```

**Notes:**
- Members list is only returned if the user is a member of the room
- Private rooms will return `403` error if user is not a member

---

### 6. Update Room
**PUT** `/api/rooms/:shortCode`

Update room settings. **Only the room owner can update.**

**Request Body:**
```json
{
  "name": "Updated Room Name",
  "accessType": "protected",
  "maxUsers": 20
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Room updated successfully",
  "data": {
    "room": {
      "id": "uuid-here",
      "name": "Updated Room Name",
      "short_code": "ABC12345",
      "owner_id": "user-uuid",
      "access_type": "protected",
      "max_users": 20,
      "is_active": true,
      "created_at": "2026-02-06T10:00:00.000Z",
      "updated_at": "2026-02-06T11:00:00.000Z"
    }
  }
}
```

**Possible Errors:**
- `403`: Only the room owner can update the room
- `404`: Room not found

---

### 7. Leave Room
**POST** `/api/rooms/:shortCode/leave`

Leave a room you're a member of.

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully left the room",
  "data": null
}
```

**Possible Errors:**
- `400`: You are not a member of this room
- `403`: Room owner cannot leave the room (must delete instead)
- `404`: Room not found

---

### 8. Delete Room
**DELETE** `/api/rooms/:shortCode`

Delete a room. **Only the room owner can delete.**

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Room deleted successfully",
  "data": null
}
```

**Possible Errors:**
- `403`: Only the room owner can delete the room
- `404`: Room not found

**Notes:**
- Deleting a room will automatically:
  - Remove all members from the room (cascade delete in `room_users`)
  - Delete all operations/drawings (cascade delete in `operations`)

---

## Room Access Types

### 1. Public Rooms
- Anyone can see and join
- No password required
- Visible in public room listings

### 2. Protected Rooms
- Anyone can see
- Password required to join
- Visible in public room listings

### 3. Private Rooms
- Invitation only (not yet implemented)
- Not visible in public listings
- Users must be explicitly added by owner/moderator

---

## Permission Levels

Users in a room have one of the following permission levels:

1. **viewer**: Read-only access (can view but not draw)
2. **collaborator**: Can draw and interact with the whiteboard
3. **moderator**: Can manage users in the room
4. **owner**: Full control over the room (update/delete)

Currently, all users who join get `collaborator` permission by default.

---

## Example Usage Flow

### Creating and Joining a Room

```javascript
// 1. User A creates a room
POST /api/rooms
Headers: { Authorization: "Bearer token_A" }
Body: {
  "name": "Team Brainstorm",
  "accessType": "protected",
  "password": "team123",
  "maxUsers": 5
}
// Response: { room: { short_code: "TEAM2024" } }

// 2. User A shares the short code "TEAM2024" and password with User B

// 3. User B joins the room
POST /api/rooms/join
Headers: { Authorization: "Bearer token_B" }
Body: {
  "shortCode": "TEAM2024",
  "password": "team123"
}
// Response: Successfully joined

// 4. Both users can now collaborate in room "TEAM2024"
```

---

## Database Schema

### Tables Involved

1. **rooms**: Stores room information
2. **room_users**: Junction table linking users to rooms
3. **operations**: Stores drawing operations (not yet implemented)

### Short Code Generation

The `short_code` is automatically generated using a PostgreSQL trigger:
- 8 random alphanumeric characters (A-Z, 0-9)
- Guaranteed to be unique
- Case-insensitive for user entry (converted to uppercase)

---

## Testing the APIs

Use the following curl commands or Postman to test:

```bash
# Create a room
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","accessType":"public"}'

# Join a room
curl -X POST http://localhost:5000/api/rooms/join \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shortCode":"ABC12345"}'

# Get my rooms
curl -X GET http://localhost:5000/api/rooms/my-rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```
