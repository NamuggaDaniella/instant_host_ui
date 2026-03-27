/**
 * theme.js — INSTANT HOST global brand tokens
 * Uganda Christian University (UCU) student project
 *
 * Import from here instead of re-declaring in every file:
 *   import { BRAND, STATUS_COLORS, ROLE_COLORS } from '../theme';
 */

export const BRAND = {
    navy: '#1B2A6B',
    navyDark: '#111A4A',
    deepPurple: '#6D28D9',
    goldLight: '#FEF3D9',
    white: '#FFFFFF',
    offWhite: '#F5F7FA',
};

export const STATUS_COLORS = {
    PENDING: { bg: '#FFF3E0', text: '#ED6C02' },
    APPROVED: { bg: '#E3F2FD', text: '#0288D1' },
    COMPLETED: { bg: '#E8F5E9', text: '#2E7D32' },
    DECLINED: { bg: '#FFEBEE', text: '#D32F2F' },
    CANCELLED: { bg: '#F5F5F5', text: '#9E9E9E' },
};

export const ROLE_COLORS = {
    ADMIN: { bg: '#FDE8D0', text: '#D07A2D' },
    CUSTODIAN: { bg: '#E3F2FD', text: '#0288D1' },
    STUDENT: { bg: '#E8F5E9', text: '#2E7D32' },
};

/** Cycle through a set of card header gradients by index */
export const CARD_GRADIENTS = [
    `linear-gradient(135deg, ${BRAND.navy} 0%, #243480 100%)`,
    `linear-gradient(135deg, #2B5EA7 0%, #3A7BC8 100%)`,
    `linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)`,
    `linear-gradient(135deg, #B45309 0%, #D97706 100%)`,
];
