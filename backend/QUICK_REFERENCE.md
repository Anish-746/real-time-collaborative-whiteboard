# 🚀 Room API Quick Reference

## 📋 Summary

**What was implemented:**
- ✅ Auto-generated 8-character short codes (e.g., "ABC12345")
- ✅ 3 room access types: Public, Protected (password), Private
- ✅ All routes are **PROTECTED** (require JWT authentication)
- ✅ Permission-based access control
- ✅ Complete CRUD operations for rooms

---

## 🔑 Room Short Codes

Instead of sharing long UUIDs like:
```
c5f8a7b2-3d4e-4f5a-8b9c-1d2e3f4a5b6c
```

Users share short codes like:
```
ABC12345
```

**Auto-generated via PostgreSQL trigger** ✨

---

## 🌐 API Endpoints

| Method | Endpoint | Auth Required | Owner Only |
|--------|----------|---------------|------------|
| POST | `/api/rooms` | ✅ | - |
| POST | `/api/rooms/join` | ✅ | - |
| GET | `/api/rooms/my-rooms` | ✅ | - |
| GET | `/api/rooms/public` | ✅ | - |
| GET | `/api/rooms/:shortCode` | ✅ | - |
| PUT | `/api/rooms/:shortCode` | ✅ | ✅ |
| POST | `/api/rooms/:shortCode/leave` | ✅ | ❌ |
| DELETE | `/api/rooms/:shortCode` | ✅ | ✅ |

---

## 🎯 Quick Start

### 1. Deploy Schema
Run `supabase-schema.sql` in Supabase SQL Editor

### 2. Create Room
```bash
POST /api/rooms
Authorization: Bearer <token>
Body: {
  "name": "My Room",
  "accessType": "public"
}
```

**Returns:**
```json
{
  "room": {
    "short_code": "ABC12345"  // ← Share this!
  }
}
```

### 3. Join Room
```bash
POST /api/rooms/join
Authorization: Bearer <token>
Body: {
  "shortCode": "ABC12345"
}
```

---

## 🔐 Access Types

### Public
- ✅ Anyone can join
- 🔓 No password needed
- 👁️ Visible in public listings

### Protected
- ✅ Anyone can join **with password**
- 🔒 Password required
- 👁️ Visible in public listings

### Private
- ❌ Invitation only
- 🔒 Cannot join directly
- 🙈 Not visible in public listings

---

## 👥 Permission Levels

When users join a room, they get a permission level:

| Level | Can Draw | Can Update Room | Can Delete Room |
|-------|----------|-----------------|-----------------|
| **Owner** | ✅ | ✅ | ✅ |
| **Moderator** | ✅ | ❌ | ❌ |
| **Collaborator** | ✅ | ❌ | ❌ |
| **Viewer** | ❌ | ❌ | ❌ |

**Default:** Users join as `collaborator`

---

## ⚡ Common Operations

### Create Public Room
```json
{
  "name": "Open Whiteboard",
  "accessType": "public",
  "maxUsers": 10
}
```

### Create Password-Protected Room
```json
{
  "name": "Team Meeting",
  "accessType": "protected",
  "password": "secret123",
  "maxUsers": 5
}
```

### Join Public Room
```json
{
  "shortCode": "ABC12345"
}
```

### Join Protected Room
```json
{
  "shortCode": "XYZ67890",
  "password": "secret123"
}
```

---

## 📁 Files Created

```
backend/
├── supabase-schema.sql           (UPDATED - short_code added)
├── src/
│   ├── models/
│   │   └── room.models.js        (NEW - Room database operations)
│   ├── controllers/
│   │   ├── room.controllers.js   (NEW - Room API logic)
│   │   └── index.js              (UPDATED - imports)
│   ├── routes/
│   │   └── room.routes.js        (NEW - Room endpoints)
│   ├── middleware/
│   │   └── validation.js         (UPDATED - room validations)
│   └── app.js                    (UPDATED - room routes)
│
└── Documentation/
    ├── ROOM_API_DOCS.md          (Detailed API docs)
    ├── TESTING_GUIDE.md          (Testing instructions)
    ├── ARCHITECTURE.md           (System diagrams)
    ├── IMPLEMENTATION_SUMMARY.md (What was built)
    └── QUICK_REFERENCE.md        (This file)
```

---

## 🧪 Test It!

### 1. Register/Login
```bash
POST /api/auth/register
Body: {
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test1234"
}
```
Save the `accessToken`!

### 2. Create Room
```bash
POST /api/rooms
Authorization: Bearer <token>
Body: {"name": "Test Room", "accessType": "public"}
```
Save the `short_code`!

### 3. Join Room (different user)
```bash
POST /api/rooms/join
Authorization: Bearer <different_token>
Body: {"shortCode": "ABC12345"}
```

---

## ⚠️ Important Rules

1. **All routes require authentication** - No anonymous access
2. **Owner cannot leave room** - Must delete instead
3. **Short codes are unique** - Generated automatically
4. **Passwords are hashed** - Using bcrypt
5. **Deleting room cascades** - Removes all members & operations

---

## 🐛 Common Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| 401 | Access token is required | Include Authorization header |
| 404 | Room not found | Check short code is correct |
| 403 | Room is full | Wait for space or ask owner to increase limit |
| 401 | Incorrect room password | Verify password with room creator |
| 403 | Only owner can update | Must be room owner to modify settings |

---

## 💡 Tips

- **Share short codes** instead of UUIDs (user-friendly!)
- **Use protected rooms** for sensitive collaboration
- **Set max_users** to control room size
- **Check member count** before sharing with large groups
- **Delete inactive rooms** to keep things tidy

---

## 📊 Database Triggers

Short codes are generated **automatically** via:

```sql
CREATE TRIGGER trigger_set_room_short_code
  BEFORE INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_room_short_code();
```

You don't need to generate them manually! 🎉

---

## 🔗 Frontend Integration

When building the frontend, you'll need to:

1. **Store JWT token** after login
2. **Include token** in all room API calls
3. **Display short_code** prominently for sharing
4. **Handle errors** gracefully (404, 403, etc.)
5. **Show permission level** to users
6. **Implement join flow** with password input for protected rooms

---

## 🎨 Next Features (Future)

- [ ] Room invitations for private rooms
- [ ] Kick/ban users (moderators)
- [ ] Transfer ownership
- [ ] Room activity logs
- [ ] Custom short codes (user-defined)
- [ ] Room expiration/auto-cleanup
- [ ] Room categories/tags

---

## 📞 Need Help?

Check the detailed documentation:
- **API Details:** `ROOM_API_DOCS.md`
- **Testing:** `TESTING_GUIDE.md`
- **Architecture:** `ARCHITECTURE.md`
- **Implementation:** `IMPLEMENTATION_SUMMARY.md`

---

**Happy Collaborating! 🎨✨**
