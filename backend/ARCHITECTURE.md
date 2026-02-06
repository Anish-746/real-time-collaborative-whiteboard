# Room System Architecture & Flow

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS TABLE                          │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID                                     │
│ username          │ VARCHAR(50) UNIQUE                       │
│ email             │ VARCHAR(255) UNIQUE                      │
│ password          │ VARCHAR(255)                             │
│ first_name        │ VARCHAR(100)                             │
│ last_name         │ VARCHAR(100)                             │
│ avatar            │ TEXT                                     │
│ is_active         │ BOOLEAN                                  │
│ last_login        │ TIMESTAMPTZ                              │
│ created_at        │ TIMESTAMPTZ                              │
│ updated_at        │ TIMESTAMPTZ                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        ROOMS TABLE                           │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID                                     │
│ name              │ VARCHAR(100)                             │
│ short_code        │ VARCHAR(10) UNIQUE ← AUTO-GENERATED     │
│ owner_id (FK)     │ UUID → users.id                         │
│ access_type       │ public/private/protected                │
│ password_hash     │ VARCHAR(255)                             │
│ max_users         │ INTEGER (default 10)                     │
│ is_active         │ BOOLEAN (default true)                   │
│ created_at        │ TIMESTAMPTZ                              │
│ updated_at        │ TIMESTAMPTZ                              │
└─────────────────────────────────────────────────────────────┘
                │                           │
                │                           │
                ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     ROOM_USERS TABLE                         │
│                    (Junction Table)                          │
├─────────────────────────────────────────────────────────────┤
│ room_id (FK, PK)  │ UUID → rooms.id                         │
│ user_id (FK, PK)  │ UUID → users.id                         │
│ permission_level  │ viewer/collaborator/moderator/owner     │
│ joined_at         │ TIMESTAMPTZ                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    OPERATIONS TABLE                          │
│                  (Drawing Operations)                        │
├─────────────────────────────────────────────────────────────┤
│ id (PK)           │ UUID                                     │
│ room_id (FK)      │ UUID → rooms.id                         │
│ user_id (FK)      │ UUID → users.id                         │
│ operation_type    │ draw/erase/shape/text/image/undo/redo   │
│ operation_data    │ JSONB                                    │
│ timestamp         │ TIMESTAMPTZ                              │
│ vector_clock      │ JSONB                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Short Code Generation Flow

```
User Creates Room
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Backend: POST /api/rooms                            │
│  - Validates input                                   │
│  - Hashes password (if protected)                    │
│  - Inserts into rooms table                          │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Database TRIGGER: trigger_set_room_short_code       │
│  BEFORE INSERT ON rooms                              │
│                                                       │
│  Calls: set_room_short_code()                        │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Function: set_room_short_code()                     │
│  IF short_code IS NULL OR empty THEN                 │
│    NEW.short_code = generate_short_code()            │
│  END IF                                              │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Function: generate_short_code()                     │
│                                                       │
│  1. Generate 8 random chars from [A-Z0-9]            │
│  2. Check if code exists in rooms table              │
│  3. If exists, regenerate (loop)                     │
│  4. Return unique code                               │
│                                                       │
│  Example: "ABC12345"                                 │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Database: Room inserted with short_code             │
│                                                       │
│  - id: "uuid-123..."                                 │
│  - name: "My Room"                                   │
│  - short_code: "ABC12345" ← AUTO-GENERATED          │
│  - owner_id: "user-uuid"                             │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Auto-add owner to room_users                        │
│                                                       │
│  - room_id: "uuid-123..."                            │
│  - user_id: "user-uuid"                              │
│  - permission_level: "owner"                         │
└──────────────────────────────────────────────────────┘
       │
       ▼
    Return to User:
    { short_code: "ABC12345" }
```

---

## Room Creation & Joining Flow

```
┌──────────────┐
│   User A     │
│  (Creator)   │
└──────┬───────┘
       │
       │ 1. POST /api/rooms
       │    { name: "Team Room", accessType: "protected", password: "secret" }
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Backend: createRoom()                               │
│  - Validate JWT token ✓                             │
│  - Validate input ✓                                  │
│  - Hash password (bcrypt) ✓                          │
│  - Create room in DB ✓                               │
│  - Auto-generate short_code via trigger ✓           │
│  - Add creator to room_users as "owner" ✓           │
└──────────────────────────────────────────────────────┘
       │
       │ Response: { room: { short_code: "TEAM2024" } }
       │
       ▼
┌──────────────┐
│   User A     │
│ Shares Code  │
│  "TEAM2024"  │
│     +        │
│  "secret"    │
└──────┬───────┘
       │
       │ Shares with User B
       │
       ▼
┌──────────────┐
│   User B     │
│   (Joiner)   │
└──────┬───────┘
       │
       │ 2. POST /api/rooms/join
       │    { shortCode: "TEAM2024", password: "secret" }
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Backend: joinRoom()                                 │
│                                                       │
│  1. Validate JWT token ✓                            │
│  2. Find room by short_code ✓                       │
│  3. Check room exists ✓                              │
│  4. Check room is active ✓                           │
│  5. Check if already member ✓                        │
│  6. Validate access type:                            │
│     - public: Allow ✓                                │
│     - protected: Verify password ✓                   │
│     - private: Reject (need invitation) ✗           │
│  7. Check room capacity (current < max_users) ✓     │
│  8. Add user to room_users as "collaborator" ✓      │
└──────────────────────────────────────────────────────┘
       │
       │ Response: { room: {...}, permission_level: "collaborator" }
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Both User A and User B are now in "TEAM2024"       │
│                                                       │
│  User A: permission = "owner"                        │
│  User B: permission = "collaborator"                 │
└──────────────────────────────────────────────────────┘
```

---

## Access Control Flow

```
                      User makes request
                             │
                             ▼
                  ┌────────────────────┐
                  │  Authentication    │
                  │  Middleware        │
                  │                    │
                  │  - Check JWT token │
                  │  - Verify user     │
                  │  - Set req.user    │
                  └─────────┬──────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
              Valid                  Invalid
                │                       │
                ▼                       ▼
      ┌──────────────────┐    ┌──────────────┐
      │  Continue to     │    │  Return 401  │
      │  Controller      │    │  Unauthorized│
      └─────────┬────────┘    └──────────────┘
                │
                ▼
      ┌──────────────────────────────────────┐
      │  Controller Permission Checks        │
      └──────────────────────────────────────┘
                │
                ├─ CREATE ROOM
                │  ✓ Any authenticated user
                │
                ├─ JOIN ROOM
                │  ├─ Public: ✓ Anyone
                │  ├─ Protected: ✓ With password
                │  └─ Private: ✗ Need invitation
                │
                ├─ UPDATE ROOM
                │  ├─ Check: room.owner_id === req.user.id
                │  └─ If not: Return 403 Forbidden
                │
                ├─ DELETE ROOM
                │  ├─ Check: room.owner_id === req.user.id
                │  └─ If not: Return 403 Forbidden
                │
                ├─ LEAVE ROOM
                │  ├─ Check: User is member
                │  ├─ Check: User is NOT owner
                │  └─ If owner: Return 403 (must delete)
                │
                └─ GET ROOM DETAILS
                   ├─ Public/Protected: ✓ Anyone
                   ├─ Private: Only members
                   └─ Members list: Only if user is member
```

---

## Permission Level Hierarchy

```
┌──────────────────────────────────────────────────────┐
│                   OWNER (Highest)                     │
│  - Can update room settings                          │
│  - Can delete room                                   │
│  - Can manage all members                            │
│  - Can draw/edit                                     │
│  - Cannot leave (must delete room)                   │
└──────────────────────────────────────────────────────┘
                      ▲
                      │
┌──────────────────────────────────────────────────────┐
│                   MODERATOR                          │
│  - Can kick/ban users (future)                       │
│  - Can manage some members                           │
│  - Can draw/edit                                     │
│  - Can leave room                                    │
└──────────────────────────────────────────────────────┘
                      ▲
                      │
┌──────────────────────────────────────────────────────┐
│                 COLLABORATOR (Default)               │
│  - Can draw/edit                                     │
│  - Can view all content                              │
│  - Can leave room                                    │
└──────────────────────────────────────────────────────┘
                      ▲
                      │
┌──────────────────────────────────────────────────────┐
│                   VIEWER (Lowest)                    │
│  - Read-only access                                  │
│  - Cannot draw/edit                                  │
│  - Can leave room                                    │
└──────────────────────────────────────────────────────┘
```

---

## API Endpoint Security

```
All endpoints: /api/rooms/*

┌─────────────────────────────────────────────────────┐
│  Authentication Layer (authenticate middleware)     │
│                                                      │
│  ✓ Checks Authorization header                      │
│  ✓ Verifies JWT token                               │
│  ✓ Loads user data into req.user                    │
│  ✓ Checks user is active                            │
│                                                      │
│  Applied to ALL room routes                         │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Validation Layer (express-validator)               │
│                                                      │
│  ✓ Validates request body                           │
│  ✓ Sanitizes input                                  │
│  ✓ Returns 400 on validation errors                 │
│                                                      │
│  Applied to POST/PUT routes                         │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Controller Layer (Business Logic)                  │
│                                                      │
│  ✓ Checks resource ownership                        │
│  ✓ Verifies permissions                             │
│  ✓ Validates room access                            │
│  ✓ Checks capacity                                  │
│  ✓ Returns appropriate errors                       │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Database Layer (RLS + Service Role)                │
│                                                      │
│  ✓ Row Level Security policies                      │
│  ✓ Service role bypass (backend trusted)            │
│  ✓ Foreign key constraints                          │
│  ✓ Unique constraints                               │
│  ✓ Cascade deletes                                  │
└─────────────────────────────────────────────────────┘
```

---

## Room Lifecycle

```
┌─────────────────┐
│  Room Created   │
│  - Owner added  │
│  - short_code   │
│    generated    │
│  - is_active=T  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Users Join     │────▶│  room_users      │
│  - Public: ✓    │     │  - user_id       │
│  - Protected: ✓ │     │  - permission    │
│  - Private: ✗   │     │  - joined_at     │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Users Draw     │────▶│  operations      │
│  - Collaborators│     │  - draw data     │
│  - Moderators   │     │  - timestamp     │
│  - Owner        │     │  - user_id       │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Users Leave    │
│  - Removed from │
│    room_users   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Owner Deletes  │────▶│  CASCADE DELETE  │
│  Room           │     │  - room_users    │
│                 │     │  - operations    │
└─────────────────┘     └──────────────────┘
```

---

## Error Handling Flow

```
Request → Middleware → Controller → Database
                                        │
                                        ▼
                                   Error occurs
                                        │
            ┌───────────────────────────┴──────────────┐
            │                                          │
            ▼                                          ▼
    ┌──────────────┐                          ┌──────────────┐
    │  ApiError    │                          │  DB Error    │
    │  (Custom)    │                          │  (Supabase)  │
    └──────┬───────┘                          └──────┬───────┘
           │                                          │
           └───────────────┬──────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Error Handler │
                  │  Middleware    │
                  └────────┬───────┘
                           │
                           ▼
                  ┌────────────────┐
                  │  Return JSON   │
                  │  {             │
                  │    success: F  │
                  │    message: "" │
                  │    statusCode  │
                  │  }             │
                  └────────────────┘
```

This architecture ensures:
- ✅ **Security**: All routes protected with JWT
- ✅ **Uniqueness**: Short codes guaranteed unique
- ✅ **Scalability**: Database triggers handle code generation
- ✅ **Flexibility**: Multiple access types supported
- ✅ **Data Integrity**: Foreign keys and cascades
- ✅ **User Experience**: Simple 8-char codes instead of UUIDs
