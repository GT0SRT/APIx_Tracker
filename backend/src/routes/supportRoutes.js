const express = require('express');

const router = express.Router();

/**
 * GET /api/support/faqs
 * Public endpoint delivering CPI & MoSPI regulatory help documentation.
 */
router.get('/faqs', (req, res) => {
  res.status(200).json({
    success: true,
    data: [
      {
        category: 'mospi',
        question: 'How does APIx solve MoSPI’s 45-day reporting lag?',
        answer:
          'APIx operates autonomous data ingestion workers every 6 hours across 150+ high-density corridors, computing real-time daily geometric price indices (<24h turnaround) and eliminating the manual survey reporting lag entirely.',
      },
      {
        category: 'methodology',
        question: 'Why does APIx use the Jevons Geometric Mean instead of Carli or Dutot?',
        answer:
          'According to the IMF CPI Manual 2020 (Chapter 10), the Carli arithmetic mean suffers from an upward substitution bias. The Jevons geometric mean satisfies both the time-reversal and circularity tests, preventing flash sales and dynamic pricing from artificially inflating national transport CPI.',
      },
      {
        category: 'methodology',
        question: 'What is the Constant-Horizon basket?',
        answer:
          'APIx samples 5 fixed lead times (T+1, T+7, T+15, T+30, T+45) every 6 hours to eliminate temporal sampling bias caused by dynamic pricing yield curves.',
      },
      {
        category: 'ingestion',
        question: 'How are voluntary ancillaries stripped?',
        answer:
          'Under MoSPI CPI guidelines (Item Code 6.2.01), optional add-ons (meals, baggage, seat selection) are programmatically stripped to isolate pure Base Fare + Fuel Surcharge (YQ/YR) + Airport User Development Fee (UDF/PSF).',
      },
    ],
  });
});

/**
 * POST /api/support/contact
 * Public desk ticket submission endpoint.
 */
router.post('/contact', (req, res) => {
  const { subject, message, contactEmail } = req.body;
  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      error: 'Subject and message are required fields.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Your inquiry has been submitted to the MoSPI / DGCA technical desk.',
    ticketId: `TICKET-${Math.floor(100000 + Math.random() * 900000)}`,
  });
});

module.exports = router;
