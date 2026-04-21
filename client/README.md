# CineSphere Frontend

Beautiful React + Vite cinema seat booking UI designed with Tailwind CSS.

## Pages & Components

### 📄 Pages

- **Home** (`/`) - Movie listings with search and filter
- **MovieDetail** (`/movie/:id`) - Movie info + showtime selection
- **Booking** (`/booking/:showtimeId`) - 3D seat picker + booking summary
- **Login** (`/login`) - Authentication
- **Register** (`/register`) - Sign up form
- **MyTickets** (`/tickets`) - Booking history

### 🎨 Components

- **Navbar** - Navigation with user menu
- **MovieCard** - Movie card with hover effects
- **SeatPicker** - Interactive 3D cinema seat grid (placeholder in Booking page)
- **TicketCard** - Animated ticket display (coming in implementation)

## Design Features

✨ **Modern Dark Theme**

- Gradient backgrounds (slate-900 to slate-800)
- Cyan accent colors (#0ea5e9)
- Glass-morphism effects with backdrop blur

🎬 **Cinema Theme**

- Movie posters and cards
- Seat selection grid
- Booking summaries
- Ticket displays

📱 **Responsive Design**

- Mobile-first approach
- Responsive grid layouts
- Hamburger menu for mobile

⚡ **Interactive Elements**

- Hover effects and transitions
- Form validation
- Loading states
- Error handling

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- Framer Motion (for animations)

## Next Steps

- Connect to backend API
- Implement real-time Socket.io
- Add Razorpay payment integration
- Implement QR code generation
- Add animated ticket download
