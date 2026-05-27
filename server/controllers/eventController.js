const db = require('../config/db');

exports.createEvent = async (req, res) => {
  const { title, description, event_date, start_time, location, category, banner_image, tickets } = req.body;
  const organizerId = req.user.id;

  try {
    if (!title || !event_date || !start_time || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!tickets || tickets.length === 0) {
      return res.status(400).json({ message: 'At least one ticket type is required' });
    }

    // Validate tickets
    for (const ticket of tickets) {
      if (!ticket.ticket_type || !ticket.price || !ticket.available_quantity) {
        return res.status(400).json({ message: 'All ticket fields are required' });
      }
    }

    // Insert event
    const [result] = await db.query(
      'INSERT INTO events (organizer_id, title, description, event_date, start_time, location, category, banner_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [organizerId, title, description, event_date, start_time, location, category, banner_image, 'pending']
    );

    const eventId = result.insertId;

    // Insert tickets
    for (const ticket of tickets) {
      await db.query(
        'INSERT INTO tickets (event_id, ticket_name, price, quantity_available) VALUES (?, ?, ?, ?)',
        [eventId, ticket.ticket_type, parseFloat(ticket.price), parseInt(ticket.available_quantity)]
      );
    }

    res.status(201).json({ message: 'Event created successfully. Pending admin approval' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getPublicEvents = async (req, res) => {
  const { search, category } = req.query;

  try {
    let query = 'SELECT e.*, u.full_name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.user_id WHERE e.status = "approved"';
    const params = [];

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND e.category = ?';
      params.push(category);
    }

    query += ' ORDER BY e.event_date ASC';

    const [events] = await db.query(query, params);
    
    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const [tickets] = await db.query(
          'SELECT * FROM tickets WHERE event_id = ?',
          [event.event_id]
        );
        return { ...event, tickets };
      })
    );
    
    res.json(eventsWithTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const [events] = await db.query(
      'SELECT e.*, u.full_name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.user_id WHERE e.event_id = ? AND e.status = "approved"',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const [tickets] = await db.query(
      'SELECT * FROM tickets WHERE event_id = ?',
      [eventId]
    );

    res.json({
      ...events[0],
      tickets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrganizerEvents = async (req, res) => {
  const organizerId = req.user.id;

  try {
    const [events] = await db.query(
      'SELECT e.*, u.full_name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.user_id WHERE e.organizer_id = ? ORDER BY e.created_at DESC',
      [organizerId]
    );

    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const [tickets] = await db.query(
          'SELECT * FROM tickets WHERE event_id = ?',
          [event.event_id]
        );
        return { ...event, tickets };
      })
    );

    res.json(eventsWithTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const { title, description, eventDate, startTime, location, category, bannerImage } = req.body;
  const organizerId = req.user.id;

  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE event_id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (events.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or event not found' });
    }

    await db.query(
      'UPDATE events SET title = ?, description = ?, event_date = ?, start_time = ?, location = ?, category = ?, banner_image = ? WHERE event_id = ?',
      [title, description, eventDate, startTime, location, category, bannerImage, eventId]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.user.id;

  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE event_id = ? AND organizer_id = ?',
      [eventId, organizerId]
    );

    if (events.length === 0) {
      return res.status(403).json({ message: 'Unauthorized or event not found' });
    }

    await db.query('DELETE FROM events WHERE event_id = ?', [eventId]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT e.*, u.full_name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.user_id WHERE e.status = "pending" ORDER BY e.created_at ASC'
    );

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE event_id = ? AND status = "pending"',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found or already processed' });
    }

    await db.query(
      'UPDATE events SET status = "approved" WHERE event_id = ?',
      [eventId]
    );

    res.json({ message: 'Event approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE event_id = ? AND status = "pending"',
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found or already processed' });
    }

    await db.query(
      'UPDATE events SET status = "rejected" WHERE event_id = ?',
      [eventId]
    );

    res.json({ message: 'Event rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT e.*, u.full_name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.user_id ORDER BY e.event_date ASC'
    );

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const [bookings] = await db.query(
      `SELECT b.*, e.event_id, e.title, e.event_date, e.start_time, e.location, e.banner_image, e.category
       FROM bookings b
       JOIN tickets t ON b.ticket_id = t.ticket_id
       JOIN events e ON t.event_id = e.event_id
       WHERE b.user_id = ? AND b.status IN ('confirmed', 'pending')
       ORDER BY e.event_date ASC`,
      [userId]
    );

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    
    const [[{ publishedEvents }]] = await db.query('SELECT COUNT(*) as publishedEvents FROM events WHERE status = "approved"');
    
    const [[{ totalRevenue = 0 }]] = await db.query('SELECT COALESCE(SUM(total_price), 0) as totalRevenue FROM bookings WHERE status = "confirmed"');

    const [[{ usersThisWeek = 0 }]] = await db.query('SELECT COUNT(*) as usersThisWeek FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');

    const [[{ eventsThisMonth = 0 }]] = await db.query('SELECT COUNT(*) as eventsThisMonth FROM events WHERE status = "approved" AND YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())');

    const [[{ thisMonthRevenue = 0 }]] = await db.query('SELECT COALESCE(SUM(total_price), 0) as thisMonthRevenue FROM bookings WHERE status = "confirmed" AND YEAR(booking_date) = YEAR(NOW()) AND MONTH(booking_date) = MONTH(NOW())');

    const [[{ lastMonthRevenue = 0 }]] = await db.query('SELECT COALESCE(SUM(total_price), 0) as lastMonthRevenue FROM bookings WHERE status = "confirmed" AND YEAR(booking_date) = YEAR(NOW()) AND MONTH(booking_date) = MONTH(NOW()) - 1');

    let revenueGrowthPercentage = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowthPercentage = (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(0);
    }

    res.json({
      totalUsers,
      publishedEvents,
      totalRevenue: parseFloat(totalRevenue) || 0,
      usersThisWeek,
      eventsThisMonth,
      revenueGrowthPercentage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrganizerEventById = async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.user.id;

  try {
    const [events] = await db.query(
      'SELECT e.*, u.full_name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.user_id WHERE e.event_id = ? AND e.organizer_id = ?',
      [eventId, organizerId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const [tickets] = await db.query(
      'SELECT * FROM tickets WHERE event_id = ?',
      [eventId]
    );

    res.json({
      ...events[0],
      tickets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id as id, full_name as name, email, role, created_at as joined FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  const { eventId, ticketSelections, totalAmount, paymentMethod, bookingRef } = req.body;
  const userId = req.user.id;

  try {
    if (!eventId || !ticketSelections || Object.keys(ticketSelections).length === 0 || !totalAmount) {
      console.log('Missing required fields:', { eventId, ticketSelections, totalAmount });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bookings = [];
    
    for (const [ticketId, quantity] of Object.entries(ticketSelections)) {
      if (quantity > 0) {
        try {
          const [tickets] = await db.query(
            'SELECT price FROM tickets WHERE ticket_id = ?',
            [ticketId]
          );

          if (tickets.length === 0) {
            console.log('Ticket not found:', ticketId);
            return res.status(404).json({ message: `Ticket ${ticketId} not found` });
          }

          const ticketPrice = parseFloat(tickets[0].price);
          const bookingTotal = ticketPrice * quantity;
          const qrCode = `BOOKING-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          const [result] = await db.query(
            'INSERT INTO bookings (user_id, ticket_id, quantity, total_price, status, qr_code) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, ticketId, quantity, bookingTotal, 'confirmed', qrCode]
          );

          const bookingId = result.insertId;

          await db.query(
            'UPDATE tickets SET quantity_sold = quantity_sold + ?, quantity_available = quantity_available - ? WHERE ticket_id = ?',
            [quantity, quantity, ticketId]
          );

          await db.query(
            'INSERT INTO payments (booking_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?)',
            [bookingId, bookingTotal, paymentMethod || 'card', 'completed']
          );

          bookings.push({
            booking_id: bookingId,
            ticket_id: ticketId,
            quantity,
            qr_code: qrCode
          });
        } catch (ticketError) {
          console.error('Error processing ticket:', ticketId, ticketError);
          throw ticketError;
        }
      }
    }

    res.status(201).json({
      message: 'Booking created successfully',
      bookingRef,
      bookings
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.verifyTicket = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const [booking] = await db.query(
      `SELECT 
        b.booking_id,
        b.qr_code,
        b.quantity,
        b.total_price,
        b.status,
        b.booking_date,
        t.ticket_id,
        t.ticket_name,
        t.price,
        e.event_id,
        e.title,
        e.event_date,
        e.start_time,
        e.location,
        e.banner_image,
        u.full_name as organizer_name
       FROM bookings b
       JOIN tickets t ON b.ticket_id = t.ticket_id
       JOIN events e ON t.event_id = e.event_id
       JOIN users u ON e.organizer_id = u.user_id
       WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (booking.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(booking[0]);
  } catch (error) {
    console.error('Error verifying ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
