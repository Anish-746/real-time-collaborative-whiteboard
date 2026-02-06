# Quick Testing Guide

## Prerequisites
1. Supabase project set up
2. Run the updated `supabase-schema.sql` in Supabase SQL Editor
3. Backend server running on `http://localhost:5000` (or your configured port)
4. Valid JWT access token from registration/login

---

## Step 1: Get Authentication Token

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Save the `accessToken` from the response!**

### Or Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

## Step 2: Test Room Creation

### Create a Public Room
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Room",
    "accessType": "public",
    "maxUsers": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Room created successfully",
  "data": {
    "room": {
      "id": "...",
      "name": "My First Room",
      "short_code": "ABC12345",  // ← This is the code to share!
      "owner_id": "...",
      "access_type": "public",
      "max_users": 10,
      "is_active": true
    }
  }
}
```

**Save the `short_code`!**

---

### Create a Protected Room (with password)
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Secret Room",
    "accessType": "protected",
    "password": "secret123",
    "maxUsers": 5
  }'
```

---

## Step 3: Test Joining a Room

### Join Public Room
```bash
curl -X POST http://localhost:5000/api/rooms/join \
  -H "Authorization: Bearer ANOTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shortCode": "ABC12345"
  }'
```

### Join Protected Room
```bash
curl -X POST http://localhost:5000/api/rooms/join \
  -H "Authorization: Bearer ANOTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shortCode": "XYZ67890",
    "password": "secret123"
  }'
```

---

## Step 4: Get Room Lists

### Get My Rooms
```bash
curl -X GET http://localhost:5000/api/rooms/my-rooms \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Public Rooms
```bash
curl -X GET http://localhost:5000/api/rooms/public \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Public Rooms (with limit)
```bash
curl -X GET "http://localhost:5000/api/rooms/public?limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Step 5: Get Room Details

```bash
curl -X GET http://localhost:5000/api/rooms/ABC12345 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Room details retrieved successfully",
  "data": {
    "room": { /* room details */ },
    "members": [
      {
        "id": "...",
        "username": "testuser",
        "email": "test@example.com",
        "permission_level": "owner",
        "joined_at": "..."
      }
    ],
    "member_count": 1,
    "user_permission": "owner",
    "is_member": true
  }
}
```

---

## Step 6: Update Room (Owner Only)

```bash
curl -X PUT http://localhost:5000/api/rooms/ABC12345 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Room Name",
    "maxUsers": 20
  }'
```

---

## Step 7: Leave Room

```bash
curl -X POST http://localhost:5000/api/rooms/ABC12345/leave \
  -H "Authorization: Bearer MEMBER_TOKEN"
```

**Note:** Owner cannot leave - must delete instead!

---

## Step 8: Delete Room (Owner Only)

```bash
curl -X DELETE http://localhost:5000/api/rooms/ABC12345 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Testing Scenarios

### ✅ Happy Path Tests

1. **Create Public Room** → Get short code
2. **Join with Different User** → Success
3. **Get My Rooms** → See both owned and joined rooms
4. **Get Room Details** → See members list
5. **Leave Room** → Success
6. **Delete Room** → Success

---

### ❌ Error Scenarios to Test

1. **Join Non-Existent Room**
   ```bash
   curl -X POST http://localhost:5000/api/rooms/join \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"shortCode": "INVALID1"}'
   ```
   Expected: `404 Room not found`

2. **Join Protected Room Without Password**
   ```bash
   curl -X POST http://localhost:5000/api/rooms/join \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"shortCode": "PROTECTED"}'
   ```
   Expected: `401 Password is required`

3. **Join Protected Room With Wrong Password**
   ```bash
   curl -X POST http://localhost:5000/api/rooms/join \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"shortCode": "PROTECTED", "password": "wrong"}'
   ```
   Expected: `401 Incorrect room password`

4. **Update Room as Non-Owner**
   ```bash
   curl -X PUT http://localhost:5000/api/rooms/ABC12345 \
     -H "Authorization: Bearer NON_OWNER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Hacked Name"}'
   ```
   Expected: `403 Only the room owner can update`

5. **Delete Room as Non-Owner**
   ```bash
   curl -X DELETE http://localhost:5000/api/rooms/ABC12345 \
     -H "Authorization: Bearer NON_OWNER_TOKEN"
   ```
   Expected: `403 Only the room owner can delete`

6. **Owner Tries to Leave**
   ```bash
   curl -X POST http://localhost:5000/api/rooms/ABC12345/leave \
     -H "Authorization: Bearer OWNER_TOKEN"
   ```
   Expected: `403 Room owner cannot leave the room`

7. **Create Room Without Auth Token**
   ```bash
   curl -X POST http://localhost:5000/api/rooms \
     -H "Content-Type: application/json" \
     -d '{"name": "Test"}'
   ```
   Expected: `401 Access token is required`

---

## Using Postman

### 1. Create Environment Variables
- `base_url`: `http://localhost:5000`
- `access_token`: (set after login)

### 2. Import Collection

Create these requests:

**Auth > Register**
- Method: POST
- URL: `{{base_url}}/api/auth/register`
- Body: raw JSON

**Auth > Login**
- Method: POST
- URL: `{{base_url}}/api/auth/login`
- Body: raw JSON
- Tests: `pm.environment.set("access_token", pm.response.json().data.accessToken);`

**Rooms > Create Room**
- Method: POST
- URL: `{{base_url}}/api/rooms`
- Headers: `Authorization: Bearer {{access_token}}`
- Body: raw JSON

**Rooms > Join Room**
- Method: POST
- URL: `{{base_url}}/api/rooms/join`
- Headers: `Authorization: Bearer {{access_token}}`
- Body: raw JSON

**Rooms > My Rooms**
- Method: GET
- URL: `{{base_url}}/api/rooms/my-rooms`
- Headers: `Authorization: Bearer {{access_token}}`

**Rooms > Public Rooms**
- Method: GET
- URL: `{{base_url}}/api/rooms/public`
- Headers: `Authorization: Bearer {{access_token}}`

**Rooms > Room Details**
- Method: GET
- URL: `{{base_url}}/api/rooms/:shortCode`
- Headers: `Authorization: Bearer {{access_token}}`

**Rooms > Update Room**
- Method: PUT
- URL: `{{base_url}}/api/rooms/:shortCode`
- Headers: `Authorization: Bearer {{access_token}}`
- Body: raw JSON

**Rooms > Leave Room**
- Method: POST
- URL: `{{base_url}}/api/rooms/:shortCode/leave`
- Headers: `Authorization: Bearer {{access_token}}`

**Rooms > Delete Room**
- Method: DELETE
- URL: `{{base_url}}/api/rooms/:shortCode`
- Headers: `Authorization: Bearer {{access_token}}`

---

## Quick Verification Checklist

- [ ] Schema deployed to Supabase
- [ ] Backend server running
- [ ] Can register new user
- [ ] Can login and get token
- [ ] Can create public room (get short code)
- [ ] Can create protected room with password
- [ ] Second user can join public room
- [ ] Second user can join protected room with correct password
- [ ] Can get list of my rooms
- [ ] Can get list of public rooms
- [ ] Can get room details with members
- [ ] Can update room settings as owner
- [ ] Non-owner cannot update/delete room
- [ ] Member can leave room
- [ ] Owner cannot leave (must delete)
- [ ] Owner can delete room

---

## Troubleshooting

### Error: "Access token is required"
- Make sure you're including the Authorization header
- Format: `Authorization: Bearer <token>`

### Error: "Room not found"
- Check the short code is correct
- Codes are case-insensitive but must exist

### Error: "Invalid or expired token"
- Your JWT token might be expired
- Login again to get a new token

### Error: "User with this email already exists"
- Use a different email or login instead

### Database Errors
- Ensure the schema is properly deployed in Supabase
- Check that all triggers and functions are created
- Verify RLS policies allow service role access
