

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Stack, Card, CircularProgress,
    Alert, Divider, Paper, Grid, MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getRoomsByHostel, searchHostels, createBooking } from '../utils/api';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

const BRAND = { teal: '#0E7C6B', tealDark: '#065C50', orange: '#F2994A', orangeLight: '#FDE8D0', navy: '#1B2A6B' };


// in Vite apps, use import.meta.env.VITE_* instead of process.env
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xkopgpyl';

export default function BookingForm({ token, user }) {
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    const [formData, setFormData] = useState({
       
        student_name: user?.full_name || '',
        email: user?.email || '',


        school_id: '',
        phone_number: '',
        course: '',
        semester: '',
        year: '',
        hostel_id: '',
        room_id: '',
        check_in_date: '',
        check_out_date: '',
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Data for dropdowns
    const [hostels, setHostels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    // ── Load Hostels on Mount ────────────────────────────────────────────────
    useEffect(() => {
        const loadHostels = async () => {
            setLoading(true);
            try {
                const data = await searchHostels();
                setHostels(data || []);
            } catch (err) {
                setError('Failed to load hostels.');
            } finally {
                setLoading(false);
            }
        };
        loadHostels();
    }, []);

    // ── Load Rooms when Hostel Selected ──────────────────────────────────────
    useEffect(() => {
        if (!formData.hostel_id) {
            setRooms([]);
            return;
        }

        const loadRooms = async () => {
            setLoadingRooms(true);
            try {
                const data = await getRoomsByHostel(formData.hostel_id);
                setRooms(data || []);
                setFormData(prev => ({ ...prev, room_id: '' })); // Reset room selection
            } catch (err) {
                setError('Failed to load rooms.');
            } finally {
                setLoadingRooms(false);
            }
        };

        loadRooms();
    }, [formData.hostel_id]);

    // ── Handle Input Changes ─────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Validate Form ────────────────────────────────────────────────────────
    const validateForm = () => {
        const requiredFields = [
            'student_name', 'email', 'school_id', 'phone_number',
            'course', 'semester', 'year', 'hostel_id', 'room_id',
            'check_in_date', 'check_out_date',
        ];

        const missing = requiredFields.filter(field => !formData[field]);
        if (missing.length > 0) {
            showToast(`Missing required fields: ${missing.join(', ')}`, 'error', 'Validation Error');
            return false;
        }

        // Validate dates
        const checkIn = new Date(formData.check_in_date);
        const checkOut = new Date(formData.check_out_date);
        if (checkOut <= checkIn) {
            showToast('Check-out date must be after check-in date.', 'error', 'Invalid Dates');
            return false;
        }

        return true;
    };

    // ── Submit Form ──────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            // Step 1: Submit to Formspree for email notification
            const formspreeData = new FormData();
            formspreeData.append('student_name', formData.student_name);
            formspreeData.append('email', formData.email);
            formspreeData.append('school_id', formData.school_id);
            formspreeData.append('phone_number', formData.phone_number);
            formspreeData.append('course', formData.course);
            formspreeData.append('semester', formData.semester);
            formspreeData.append('year', formData.year);
            formspreeData.append('hostel_name', hostels.find(h => h.id === Number(formData.hostel_id))?.name || 'N/A');
            formspreeData.append('room_number', rooms.find(r => r.id === Number(formData.room_id))?.room_number || 'N/A');
            formspreeData.append('check_in_date', formData.check_in_date);
            formspreeData.append('check_out_date', formData.check_out_date);

            let formspreeResponse;
            try {
                formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                    body: formspreeData,
                });
            } catch (fetchError) {
                throw new Error(`Formspree network error: ${fetchError.message || 'failed to fetch'}. Check your endpoint and network/CORS settings.`);
            }

            if (!formspreeResponse.ok) {
                let errText = 'unknown';
                try {
                    const body = await formspreeResponse.text();
                    errText = body || formspreeResponse.statusText;
                } catch (_) {
                    errText = formspreeResponse.statusText;
                }
                throw new Error(`Formspree submission failed (${formspreeResponse.status}): ${errText}`);
            }

            // Step 2: Create booking record in database
            await createBooking({
                room_id: Number(formData.room_id),
                check_in_date: formData.check_in_date,
                check_out_date: formData.check_out_date,
            }, token);

            // Success
            setSuccess(true);
            showToast('Booking submitted successfully! Hostel owner will review your request.', 'success', 'Booked');

            // Redirect to bookings page after 2 seconds
            setTimeout(() => {
                navigate('/my-bookings');
            }, 2000);

        } catch (err) {
            showToast(err.message || 'Submission failed. Please try again.', 'error', 'Error');
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success State ────────────────────────────────────────────────────────
    if (success) {
        return (
            <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '70vh', textAlign: 'center',
            }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: BRAND.teal, mb: 2 }} />
                <Typography variant="h4" fontWeight={800} color={BRAND.teal} mb={1}>
                    Booking Submitted!
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    The hostel owner will review your request shortly. Check your email for updates.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/my-bookings')}
                    sx={{ bgcolor: BRAND.teal, fontWeight: 700, borderRadius: 2 }}
                >
                    View My Bookings
                </Button>
            </Box>
        );
    }

    // ── Loading State ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress sx={{ color: BRAND.teal }} />
            </Box>
        );
    }

    // ── Form Render ──────────────────────────────────────────────────────────
    return (
        <Box>
            {/* Header */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, color: BRAND.teal, fontWeight: 600 }}
            >
                Back
            </Button>

            <Paper sx={{ borderRadius: 3, p: 3, border: `2px solid ${BRAND.orange}` }}>
                {/* Title */}
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <BookOnlineIcon sx={{ fontSize: 32, color: BRAND.orange }} />
                    <Box>
                        <Typography variant="h5" fontWeight={800} color={BRAND.teal}>
                            Book a Hostel Room
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fill in all details below to submit your booking request
                        </Typography>
                    </Box>
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    {/* Section 1: Student Information */}
                    <Box mb={3}>
                        <Typography variant="h6" fontWeight={700} color={BRAND.navy} mb={2}>
                            Your Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="student_name"
                                    value={formData.student_name}
                                    onChange={handleChange}
                                    required
                                    disabled={!!user?.full_name} // Pre-filled from user
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={!!user?.email} // Pre-filled from user
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="School ID Number"
                                    name="school_id"
                                    value={formData.school_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., STU12345"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="+256 ..."
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Computer Science"
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth required>
                                    <InputLabel>Semester</InputLabel>
                                    <Select
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        label="Semester"
                                    >
                                        <MenuItem value="1">Semester 1</MenuItem>
                                        <MenuItem value="2">Semester 2</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth required>
                                    <InputLabel>Year</InputLabel>
                                    <Select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        label="Year"
                                    >
                                        <MenuItem value="1">Year 1</MenuItem>
                                        <MenuItem value="2">Year 2</MenuItem>
                                        <MenuItem value="3">Year 3</MenuItem>
                                        <MenuItem value="4">Year 4</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Section 2: Hostel & Room Selection */}
                    <Box mb={3}>
                        <Typography variant="h6" fontWeight={700} color={BRAND.navy} mb={2}>
                            Select Hostel & Room
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Hostel</InputLabel>
                                    <Select
                                        name="hostel_id"
                                        value={formData.hostel_id}
                                        onChange={handleChange}
                                        label="Hostel"
                                    >
                                        {hostels.map(h => (
                                            <MenuItem key={h.id} value={h.id}>
                                                {h.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required disabled={!formData.hostel_id || loadingRooms}>
                                    <InputLabel>Room</InputLabel>
                                    <Select
                                        name="room_id"
                                        value={formData.room_id}
                                        onChange={handleChange}
                                        label="Room"
                                    >
                                        {rooms.map(r => (
                                            <MenuItem key={r.id} value={r.id}>
                                                {r.room_number} ({r.room_type}) - {r.price_per_semester} UGX
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Section 3: Dates */}
                    <Box mb={3}>
                        <Typography variant="h6" fontWeight={700} color={BRAND.navy} mb={2}>
                            Booking Dates
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Check-in Date"
                                    name="check_in_date"
                                    type="date"
                                    value={formData.check_in_date}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Check-out Date"
                                    name="check_out_date"
                                    type="date"
                                    value={formData.check_out_date}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Submit Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{ borderColor: BRAND.teal, color: BRAND.teal, fontWeight: 700 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={submitting}
                            sx={{
                                bgcolor: BRAND.orange,
                                color: 'white',
                                fontWeight: 700,
                                '&:hover': { bgcolor: '#E08A00' },
                            }}
                        >
                            {submitting ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : null}
                            {submitting ? 'Submitting...' : 'Submit Booking'}
                        </Button>
                    </Stack>
                </form>

                {/* Info Box */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2" fontWeight={600}>
                        📧 Important: The hostel owner will receive your booking details via email and get back to you shortly.
                    </Typography>
                </Alert>
            </Paper>

            <Toast {...toast} onClose={hideToast} />
        </Box>
    );
}
