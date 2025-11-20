import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openAIWs: WebSocket | null = null;

  socket.onopen = async () => {
    console.log("Client connected to support chat");
    
    try {
      // Connect to OpenAI Realtime API
      openAIWs = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
          },
        }
      );

      openAIWs.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
      };

      openAIWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("OpenAI message:", data.type);
        
        // Send session update after receiving session.created
        if (data.type === "session.created") {
          const sessionConfig = {
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: `You are a 24/7 AI support assistant for FlowAi, an intelligent invoice processing platform for the oil & gas industry. 

Your role:
- Answer general product questions about FlowAi features and capabilities
- Provide technical support and troubleshooting guidance
- Help with account and billing inquiries
- Guide users through onboarding and training

Key product information:
- FlowAi automates invoice processing with AI-powered OCR
- Supports Peppol e-invoicing standards
- Offers duplicate detection and fraud prevention
- Includes workflow automation and validation rules
- Provides compliance tracking for oil & gas regulations

Be helpful, professional, and concise. If you don't know something, be honest and offer to escalate to human support.`,
              voice: "alloy",
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1"
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 4096
            }
          };
          openAIWs?.send(JSON.stringify(sessionConfig));
          console.log("Session configuration sent");
        }

        // Forward all messages to client
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      openAIWs.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "Connection to AI service failed" 
        }));
      };

      openAIWs.onclose = () => {
        console.log("OpenAI WebSocket closed");
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      }));
    }
  };

  socket.onmessage = (event) => {
    if (openAIWs?.readyState === WebSocket.OPEN) {
      openAIWs.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    openAIWs?.close();
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    openAIWs?.close();
  };

  return response;
});
