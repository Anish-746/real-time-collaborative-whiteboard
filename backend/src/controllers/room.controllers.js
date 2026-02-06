import { RoomModel } from '../models/room.models.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/Asynchandler.js';

/**
 * Create a new room
 * @route POST /api/rooms
 * @access Protected
 */
export const createRoom = asyncHandler(async (req, res) => {
    const { name, accessType = 'public', password, maxUsers = 10, document } = req.body;
    const userId = req.user.id;

    // Validate access type
    const validAccessTypes = ['public', 'private', 'protected'];
    if (!validAccessTypes.includes(accessType)) {
        throw new ApiError(400, 'Invalid access type. Must be public, private, or protected');
    }

    // Validate password for protected rooms
    if (accessType === 'protected' && !password) {
        throw new ApiError(400, 'Password is required for protected rooms');
    }

    // Create room
    const room = await RoomModel.create({
        name,
        ownerId: userId,
        accessType,
        password,
        maxUsers,
        document
    });

    // Convert document Buffer to base64 for response if it exists
    if (room.document) {
        room.document = Buffer.from(room.document).toString('base64');
    }

    res.status(201).json(
        new ApiResponse(
            { room },
            201,
            'Room created successfully'
        )
    );
});

/**
 * Join a room by short code
 * @route POST /api/rooms/join
 * @access Protected
 */
export const joinRoom = asyncHandler(async (req, res) => {
    const { shortCode, password } = req.body;
    const userId = req.user.id;

    // Find room by short code
    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (!room.is_active) {
        throw new ApiError(403, 'Room is not active');
    }

    // Check if user is already in room
    const existingMembership = await RoomModel.isUserInRoom(room.id, userId);
    if (existingMembership) {
        // User already in room, return room details
        return res.status(200).json(
            new ApiResponse(
                {
                    room: {
                        id: room.id,
                        name: room.name,
                        short_code: room.short_code,
                        access_type: room.access_type,
                        max_users: room.max_users,
                        owner_id: room.owner_id,
                        created_at: room.created_at
                    },
                    permission_level: existingMembership.permission_level,
                    already_member: true
                },
                200,
                'Already a member of this room'
            )
        );
    }

    // Check access type restrictions
    if (room.access_type === 'private') {
        throw new ApiError(403, 'This is a private room. You need an invitation to join');
    }

    // Verify password for protected rooms
    if (room.access_type === 'protected') {
        if (!password) {
            throw new ApiError(401, 'Password is required to join this room');
        }

        const isPasswordValid = await RoomModel.verifyPassword(password, room.password_hash);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Incorrect room password');
        }
    }

    // Check room capacity
    const currentMemberCount = await RoomModel.getRoomMemberCount(room.id);
    if (currentMemberCount >= room.max_users) {
        throw new ApiError(403, 'Room is full');
    }

    // Add user to room
    await RoomModel.addUserToRoom(room.id, userId, 'collaborator');

    res.status(200).json(
        new ApiResponse(
            {
                room: {
                    id: room.id,
                    name: room.name,
                    short_code: room.short_code,
                    access_type: room.access_type,
                    max_users: room.max_users,
                    owner_id: room.owner_id,
                    created_at: room.created_at
                },
                permission_level: 'collaborator'
            },
            200,
            'Successfully joined the room'
        )
    );
});

/**
 * Get user's rooms
 * @route GET /api/rooms/my-rooms
 * @access Protected
 */
export const getMyRooms = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const rooms = await RoomModel.getUserRooms(userId);

    // Convert document Buffers to base64 for response
    const roomsWithBase64 = rooms.map(room => ({
        ...room,
        document: room.document ? Buffer.from(room.document).toString('base64') : null
    }));

    res.status(200).json(
        new ApiResponse(
            { rooms: roomsWithBase64, count: roomsWithBase64.length },
            200,
            'Rooms retrieved successfully'
        )
    );
});

/**
 * Get public rooms
 * @route GET /api/rooms/public
 * @access Protected
 */
export const getPublicRooms = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;

    const rooms = await RoomModel.getPublicRooms(limit);

    res.status(200).json(
        new ApiResponse(
            { rooms, count: rooms.length },
            200,
            'Public rooms retrieved successfully'
        )
    );
});

/**
 * Get room details
 * @route GET /api/rooms/:shortCode
 * @access Protected
 */
export const getRoomDetails = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Check if user is a member
    const membership = await RoomModel.isUserInRoom(room.id, userId);

    if (!membership && room.access_type === 'private') {
        throw new ApiError(403, 'You do not have access to this room');
    }

    // Get room members if user has access
    let members = [];
    if (membership) {
        members = await RoomModel.getRoomMembers(room.id);
    }

    // Remove password hash from response and convert document to base64
    const { password_hash, ...roomWithoutPassword } = room;
    if (roomWithoutPassword.document) {
        roomWithoutPassword.document = Buffer.from(roomWithoutPassword.document).toString('base64');
    }

    res.status(200).json(
        new ApiResponse(
            {
                room: roomWithoutPassword,
                members: membership ? members : [],
                member_count: members.length,
                user_permission: membership?.permission_level || null,
                is_member: !!membership
            },
            200,
            'Room details retrieved successfully'
        )
    );
});

/**
 * Leave a room
 * @route POST /api/rooms/:shortCode/leave
 * @access Protected
 */
export const leaveRoom = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Check if user is in room
    const membership = await RoomModel.isUserInRoom(room.id, userId);

    if (!membership) {
        throw new ApiError(400, 'You are not a member of this room');
    }

    // Owner cannot leave their own room
    if (room.owner_id === userId) {
        throw new ApiError(403, 'Room owner cannot leave the room. Delete the room instead');
    }

    await RoomModel.removeUserFromRoom(room.id, userId);

    res.status(200).json(
        new ApiResponse(
            null,
            200,
            'Successfully left the room'
        )
    );
});

/**
 * Delete a room
 * @route DELETE /api/rooms/:shortCode
 * @access Protected (Owner only)
 */
export const deleteRoom = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Only owner can delete room
    if (room.owner_id !== userId) {
        throw new ApiError(403, 'Only the room owner can delete the room');
    }

    await RoomModel.delete(room.id);

    res.status(200).json(
        new ApiResponse(
            null,
            200,
            'Room deleted successfully'
        )
    );
});

/**
 * Update room settings
 * @route PUT /api/rooms/:shortCode
 * @access Protected (Owner only)
 */
export const updateRoom = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;
    const { name, accessType, maxUsers, document } = req.body;

    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Only owner can update room
    if (room.owner_id !== userId) {
        throw new ApiError(403, 'Only the room owner can update the room');
    }

    const updates = {};
    if (name) updates.name = name;
    if (accessType) updates.access_type = accessType;
    if (maxUsers) updates.max_users = maxUsers;
    if (document !== undefined) updates.document = document;

    const updatedRoom = await RoomModel.update(room.id, updates);

    // Convert document Buffer to base64 for response
    if (updatedRoom.document) {
        updatedRoom.document = Buffer.from(updatedRoom.document).toString('base64');
    }

    res.status(200).json(
        new ApiResponse(
            { room: updatedRoom },
            200,
            'Room updated successfully'
        )
    );
});

/**
 * Update room document
 * @route PATCH /api/rooms/:shortCode/document
 * @access Protected (Collaborators and above)
 */
export const updateRoomDocument = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;
    const { document } = req.body;

    if (!document) {
        throw new ApiError(400, 'Document data is required');
    }

    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Check if user is a member
    const membership = await RoomModel.isUserInRoom(room.id, userId);

    if (!membership) {
        throw new ApiError(403, 'You must be a member of this room');
    }

    // Check permission level (collaborator or higher)
    if (membership.permission_level === 'viewer') {
        throw new ApiError(403, 'Viewers cannot update the room document');
    }

    const updatedRoom = await RoomModel.update(room.id, { document });

    // Convert document Buffer to base64 for response
    if (updatedRoom.document) {
        updatedRoom.document = Buffer.from(updatedRoom.document).toString('base64');
    }

    res.status(200).json(
        new ApiResponse(
            { document: updatedRoom.document },
            200,
            'Room document updated successfully'
        )
    );
});

/**
 * Get room document
 * @route GET /api/rooms/:shortCode/document
 * @access Protected (Members only)
 */
export const getRoomDocument = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const room = await RoomModel.findByShortCode(shortCode);

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Check if user is a member
    const membership = await RoomModel.isUserInRoom(room.id, userId);

    if (!membership) {
        throw new ApiError(403, 'You must be a member of this room');
    }

    // Convert document Buffer to base64 for response
    const document = room.document ? Buffer.from(room.document).toString('base64') : null;

    res.status(200).json(
        new ApiResponse(
            { document },
            200,
            'Room document retrieved successfully'
        )
    );
});
