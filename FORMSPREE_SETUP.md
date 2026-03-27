# Booking Form with Formspree Integration

## Setup Instructions

This booking form component integrates **Formspree** for email notifications and creates database records for admin tracking.

### Step 1: Create a Formspree Form

1. Go to [formspree.io](https://formspree.io)
2. Sign up / log in to your account
3. Click **"Create a new form"**
4. Choose **"Email Form"** or **"Standard Form"**
5. Set your email address to receive submissions
6. Name it something like **"Hostel Booking Requests"**
7. Click **"Create"** — Formspree will give you a form endpoint URL

   Example: `https://formspree.io/f/xyzabc123`

### Step 2: Add Your Formspree Endpoint

Two options:

#### Option A: Environment Variable (Recommended for Production)
Create/update your `.env` file in `instant_host_ui/`:

```env
REACT_APP_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

Then in your `.env.local` (not committed to git):
```env
REACT_APP_FORMSPREE_ENDPOINT=https://formspree.io/f/xyz123abc
```

**Restart your dev server** after updating `.env`:
```bash
npm run dev
```

#### Option B: Direct Code Update (Quick Dev Testing)
Edit `src/pages/BookingForm.jsx` line ~23:

```javascript
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
```

Replace `YOUR_FORM_ID` with your actual Formspree form ID from step 1.

### Step 3: How It Works

When a student submits the form:

1. **Formspree Email**: The hostel owner receives an email with all booking details
2. **Database Record**: A booking record is created in your `bookings` table with status `PENDING`
3. **Admin Panel**: 
   - Custodians see it in `/booking-requests` page
   - Admins can view all bookings via the admin panel
   - Students see their bookings in `/my-bookings` page

### Step 4: Test the Form

1. Click **"Book Now"** on the student dashboard
2. Fill in all required fields
3. Submit the form
4. Verify:
   - You receive an email at your Formspree address ✅
   - A new booking appears in the database (check `/my-bookings` or admin panel) ✅

### Form Fields Captured by Formspree

The form sends the following data to your Formspree email:

- **Student Name**
- **Email**
- **School ID**
- **Phone Number**
- **Course**
- **Semester**
- **Year**
- **Hostel Name**
- **Room Number**
- **Check-in Date**
- **Check-out Date**

### Troubleshooting

**Issue**: Form submits to database but no email received
- ✓ Verify Formspree endpoint URL is correct
- ✓ Check your email spam/junk folder
- ✓ Verify email configured in Formspree is correct

**Issue**: Form won't submit
- ✓ Ensure all required fields are filled
- ✓ Check browser console for errors (`F12`)
- ✓ Verify dates: check-out must be after check-in

**Issue**: Page refreshes but form doesn't submit
- ✓ Check if Formspree endpoint is correct
- ✓ Try submitting again — Formspree rate limits apply

### Admin Access to Submissions

**View all bookings created via the form:**

1. **As Custodian** (`/booking-requests`): See pending requests for your hostels
2. **As Admin** (via direct database query): Run:
   ```sql
   SELECT * FROM bookings WHERE status = 'PENDING' ORDER BY created_at DESC;
   ```

### Production Checklist

Before deploying to production:

- [ ] Formspree form created and tested
- [ ] `.env` file configured with correct endpoint
- [ ] Form tested end-to-end (email + database)
- [ ] Email address in Formspree is monitored
- [ ] Custodians trained on `/booking-requests` workflow

### Questions?

- **Formspree Help**: https://formspree.io/help
- **Our Repo**: Check `/instant_host_ui/src/pages/BookingForm.jsx`

---

**Happy bookings! 🎉**
