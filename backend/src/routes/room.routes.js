import { Router } from 'express';
import {
    createRoom,
    joinRoom,
    getMyRooms,
    getPublicRooms,
    getRoomDetails,
    leaveRoom,
    deleteRoom,
    updateRoom,
    updateRoomDocument,
    getRoomDocument
} from '../controllers/room.controllers.js';
import { authenticate } from '../middleware/index.js';
import {
    createRoomValidation,
    joinRoomValidation,
    updateRoomValidation,
    updateRoomDocumentValidation
} from '../middleware/validation.js';
import { validateRequest } from '../middleware/index.js';

const router = Router();

// All room routes are protected (require authentication)

/**
 * @route POST /api/rooms
 * @desc Create a new room
 * @access Protected
 */
router.post(
    '/',
    authenticate,
    createRoomValidation,
    validateRequest,
    createRoom
);

/**
 * @route POST /api/rooms/join
 * @desc Join a room by short code
 * @access Protected
 */
router.post(
    '/join',
    authenticate,
    joinRoomValidation,
    validateRequest,
    joinRoom
);

/**
 * @route GET /api/rooms/my-rooms
 * @desc Get all rooms the user is a member of
 * @access Protected
 */
router.get(
    '/my-rooms',
    authenticate,
    getMyRooms
);

/**
 * @route GET /api/rooms/public
 * @desc Get all public rooms
 * @access Protected
 */
router.get(
    '/public',
    authenticate,
    getPublicRooms
);

/**
 * @route GET /api/rooms/:shortCode
 * @desc Get room details by short code
 * @access Protected
 */
router.get(
    '/:shortCode',
    authenticate,
    getRoomDetails
);

/**
 * @route PUT /api/rooms/:shortCode
 * @desc Update room settings (owner only)
 * @access Protected
 */
router.put(
    '/:shortCode',
    authenticate,
    updateRoomValidation,
    validateRequest,
    updateRoom
);

/**
 * @route POST /api/rooms/:shortCode/leave
 * @desc Leave a room
 * @access Protected
 */
router.post(
    '/:shortCode/leave',
    authenticate,
    leaveRoom
);

/**
 * @route DELETE /api/rooms/:shortCode
 * @desc Delete a room (owner only)
 * @access Protected
 */
router.delete(
    '/:shortCode',
    authenticate,
    deleteRoom
);

/**
 * @route PATCH /api/rooms/:shortCode/document
 * @desc Update room document (collaborators and above)
 * @access Protected
 */
router.patch(
    '/:shortCode/document',
    authenticate,
    updateRoomDocumentValidation,
    validateRequest,
    updateRoomDocument
);

/**
 * @route GET /api/rooms/:shortCode/document
 * @desc Get room document (members only)
 * @access Protected
 */
router.get(
    '/:shortCode/document',
    authenticate,
    getRoomDocument
);

export default router;
