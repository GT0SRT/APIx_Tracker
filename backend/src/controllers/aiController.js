const aiEngine = require('../services/aiEngine');

/**
 * POST /api/v1/ai/chat
 * Invokes the Autonomous Agentic Copilot.
 */
const chatWithAgent = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message parameter is required and must be a non-empty string.',
      });
    }

    const result = await aiEngine.runAgent(message.trim(), conversationHistory);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[AIController] Error handling agent chat:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while communicating with the AI Agent.',
    });
  }
};

/**
 * GET /api/v1/ai/health
 * Returns the operational status and registered agent tools.
 */
const getAiHealth = (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  const isConfigured = Boolean(
    apiKey &&
    !apiKey.startsWith('sk-1e3f8b0c') &&
    !apiKey.includes('your_groq_api_key')
  );

  return res.status(200).json({
    success: true,
    status: 'UP',
    engine: 'APIx Autonomous Copilot',
    provider: 'Groq Cloud Inference',
    model: 'llama-3.3-70b-versatile',
    groqConfigured: isConfigured,
    nativeToolCalling: true,
    registeredTools: [
      'get_live_macro_index',
      'get_route_fare_stats',
      'scan_anomalies_and_diagnose',
      'audit_pipeline_provenance',
    ],
  });
};

module.exports = {
  chatWithAgent,
  getAiHealth,
};
